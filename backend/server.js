const express = require("express");
const mysql = require("mysql2");
const cors = require("cors"); // allow frontend to call backend
const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

// Get all messages
app.get("/api/messages", (req, res) => {
  db.query("SELECT * FROM messages ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// Add new message
app.post("/api/messages", (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text is required" });
  }

  db.query("INSERT INTO messages (text) VALUES (?)", [text], (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ id: result.insertId, text });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
