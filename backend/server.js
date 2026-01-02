const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Frontend connected via WebSocket");

  socket.on("disconnect", () => {
    console.log("Frontend disconnected");
  });
});

// REST endpoints
app.get("/api/messages", (req, res) => {
  db.query("SELECT * FROM messages ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.post("/api/messages", (req, res) => {
  const { text, user } = req.body;
  if (!text || text.trim() === "") return res.status(400).json({ error: "Text required" });

  db.query("INSERT INTO messages (text) VALUES (?)", [text], (err, result) => {
    if (err) return res.status(500).json({ error: "DB insert failed" });

    const newMessage = { id: result.insertId, text, created_at: new Date() };

    // Emit new message to all connected clients
    io.emit("new_message", newMessage);

    res.json(newMessage);
  });
});

// Optional: Emit system messages every 30 seconds
setInterval(() => {
  const sysMsg = { id: 0, text: "System update: " + new Date().toLocaleTimeString(), created_at: new Date() };
  io.emit("new_message", sysMsg);
}, 30000);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} with WebSocket`);
});
