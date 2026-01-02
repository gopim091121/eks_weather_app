const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,       // RDS endpoint
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err);
    } else {
        console.log("MySQL connected");
        connection.release();
    }
});

// Base path /api so Ingress can route by path
app.post("/api/save-country", (req, res) => {
    const {
        country,
        latitude,
        longitude,
        timezone,
        temperature,
        windspeed,
        time
    } = req.body;

    if (!country || latitude == null || longitude == null) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
        INSERT INTO country_data 
        (country, latitude, longitude, timezone, temperature, windspeed, time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [country, latitude, longitude, timezone, temperature, windspeed, time],
        (err) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Country data saved successfully" });
        }
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
