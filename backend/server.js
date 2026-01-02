const express = require("express");
const mysql = require("mysql2");
const app = express();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

app.get("/api/messages", (req, res) => {
  db.query("SELECT * FROM messages", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});


