// dashboard/api/server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const pool = require('./db/pool');
require('dotenv').config();

const app = express();
app.use(cors());

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Recent logs, with optional filters
app.get('/api/logs', async (req, res) => {
  const { verdict, limit = 50 } = req.query;

  try {
    let query = 'SELECT * FROM request_logs';
    const params = [];

    if (verdict) {
      query += ' WHERE verdict = $1';
      params.push(verdict);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Summary stats for the dashboard header
app.get('/api/stats', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM request_logs');
    const blockedResult = await pool.query(
      "SELECT COUNT(*) FROM request_logs WHERE verdict = 'blocked'"
    );
    const techniqueBreakdown = await pool.query(`
      SELECT mitre_technique, COUNT(*) as count
      FROM request_logs
      WHERE mitre_technique IS NOT NULL
      GROUP BY mitre_technique
      ORDER BY count DESC
    `);
    const topIps = await pool.query(`
      SELECT source_ip, COUNT(*) as count
      FROM request_logs
      WHERE verdict = 'blocked'
      GROUP BY source_ip
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      total: parseInt(totalResult.rows[0].count),
      blocked: parseInt(blockedResult.rows[0].count),
      techniques: techniqueBreakdown.rows,
      topAttackerIps: topIps.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Poll the DB every 2 seconds for new rows and push to connected clients.
// A production system would use Postgres LISTEN/NOTIFY instead of polling —
// worth knowing that's the "correct" approach, but polling is simpler to
// understand first and is a fine tradeoff to name explicitly in your writeup.
let lastSeenId = 0;

async function pollForNewLogs() {
  try {
    const result = await pool.query(
      'SELECT * FROM request_logs WHERE id > $1 ORDER BY id ASC',
      [lastSeenId]
    );

    if (result.rows.length > 0) {
      lastSeenId = result.rows[result.rows.length - 1].id;
      const message = JSON.stringify({ type: 'new_logs', logs: result.rows });

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  } catch (err) {
    console.error('Poll error:', err);
  }
}

setInterval(pollForNewLogs, 2000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Dashboard API running on port ${PORT}`);
});
