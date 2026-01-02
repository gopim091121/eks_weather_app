const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
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

// WebSocket
io.on("connection", (socket) => {
  console.log("Frontend connected via WebSocket");
  socket.on("disconnect", () => console.log("Frontend disconnected"));
});

// REST Endpoints

// Get all non-deleted messages
app.get("/api/messages", (req, res) => {
  db.query("SELECT * FROM messages WHERE deleted = 0 ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// Create new message
app.post("/api/messages", (req, res) => {
  const { text, user } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  db.query("INSERT INTO messages (text, user) VALUES (?, ?)", [text, user || 'Anonymous'], (err, result) => {
    if (err) return res.status(500).json({ error: "DB insert failed" });

    const newMsg = { id: result.insertId, text, user: user || 'Anonymous', created_at: new Date(), deleted: 0 };
    io.emit("message_created", newMsg);
    res.json(newMsg);
  });
});

// Update message
app.put("/api/messages/:id", (req, res) => {
  const { text } = req.body;
  const id = req.params.id;
  if (!text) return res.status(400).json({ error: "Text required" });

  db.query("UPDATE messages SET text = ?, updated_at = NOW() WHERE id = ? AND deleted = 0", [text, id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB update failed" });
    io.emit("message_updated", { id, text, updated_at: new Date() });
    res.json({ id, text });
  });
});

// Soft delete message
app.delete("/api/messages/:id", (req, res) => {
  const id = req.params.id;
  db.query("UPDATE messages SET deleted = 1 WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB delete failed" });
    io.emit("message_deleted", { id });
    res.json({ id });
  });
});

// Optional: metrics endpoint for Prometheus
app.get("/metrics", (req, res) => {
  // Example: count total messages
  db.query("SELECT COUNT(*) AS total FROM messages", (err, rows) => {
    if (err) return res.status(500).send("DB error");
    res.send(`# HELP total_messages Total number of messages\n# TYPE total_messages gauge\ntotal_messages ${rows[0].total}`);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT} with WebSocket`));
