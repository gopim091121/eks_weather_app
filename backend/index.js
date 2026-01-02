const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST,     // RDS endpoint
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

app.get('/api/health', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.ping();
    await conn.end();
    res.json({ status: 'ok', service: 'weather-backend' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Example: GET /api/weather?city=London
app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'London';
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT city, temperature, description FROM weather WHERE city = ?',
      [city]
    );
    await conn.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: `No weather data for ${city}` });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});