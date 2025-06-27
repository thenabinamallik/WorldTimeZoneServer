// server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Connect to SQLite DB
const db = new sqlite3.Database('./timezone.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the timezone.db database.');
  }
});

// GET: /v1/list-time-zones
app.get('/v1/list-time-zones', (req, res) => {
  const sql = 'SELECT DISTINCT zone_name FROM time_zone ORDER BY zone_name';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ zones: rows.map(row => row.zone_name) });
  });
});

// GET: /v1/get-time-zone?zone_name=Asia/Tokyo
// OR   /v1/get-time-zone?country_code=JP
app.get('/v1/get-time-zone', (req, res) => {
  const { zone_name, country_code } = req.query;

  let sql, params;
  if (zone_name) {
    sql = 'SELECT * FROM time_zone WHERE zone_name = ?';
    params = [zone_name];
  } else if (country_code) {
    sql = 'SELECT * FROM time_zone WHERE country_code = ?';
    params = [country_code];
  } else {
    return res.status(400).json({ error: 'Please provide either zone_name or country_code parameter' });
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// GET: /v1/list-countries
app.get('/v1/list-countries', (req, res) => {
  const sql = 'SELECT * FROM country ORDER BY country_name';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ countries: rows });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
