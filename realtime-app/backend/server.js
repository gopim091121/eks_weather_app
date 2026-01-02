const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const amqp = require("amqplib");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, { cors: { origin: "*", methods: ["GET","POST","PUT","DELETE"] } });

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// RabbitMQ
let channel;
(async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq");
  channel = await conn.createChannel();
  await channel.assertQueue("messages", { durable: true });
})();

// Socket.IO
io.on("connection", (socket) => console.log("Frontend connected"));

// REST Endpoints
app.get("/api/messages", (req,res) => {
  db.query("SELECT * FROM messages WHERE deleted=0 ORDER BY created_at DESC", (err,rows) => {
    if(err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.post("/api/messages", (req,res) => {
  const { text, user } = req.body;
  if(!text) return res.status(400).json({ error: "Text required" });

  db.query("INSERT INTO messages (text,user) VALUES (?,?)",[text,user||'Anonymous'], (err,result) => {
    if(err) return res.status(500).json({ error: "DB insert failed" });
    const newMsg = { id: result.insertId, text, user:user||'Anonymous', created_at:new Date(), deleted:0 };
    
    // Socket.IO emit
    io.emit("message_created", newMsg);

    // RabbitMQ publish
    if(channel) channel.sendToQueue("messages", Buffer.from(JSON.stringify(newMsg)), { persistent:true });

    res.json(newMsg);
  });
});

app.put("/api/messages/:id", (req,res) => {
  const { text } = req.body;
  const id = req.params.id;
  db.query("UPDATE messages SET text=?, updated_at=NOW() WHERE id=? AND deleted=0",[text,id], (err) => {
    if(err) return res.status(500).json({ error:"DB update failed" });
    io.emit("message_updated", { id, text, updated_at:new Date() });
    res.json({ id, text });
  });
});

app.delete("/api/messages/:id", (req,res) => {
  const id = req.params.id;
  db.query("UPDATE messages SET deleted=1 WHERE id=?",[id], (err) => {
    if(err) return res.status(500).json({ error:"DB delete failed" });
    io.emit("message_deleted", { id });
    res.json({ id });
  });
});

server.listen(3000, () => console.log("Backend running on port 3000"));
