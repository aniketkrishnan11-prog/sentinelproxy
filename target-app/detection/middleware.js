// detection/middleware.js
const rules = require('./rules');
const pool = require('../db/pool');

function scanValue(value, matches) {
  if (typeof value === 'string') {
    for (const rule of rules) {
      if (rule.pattern.test(value)) {
        matches.push(rule);
      }
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      scanValue(value[key], matches);
    }
  }
}

async function detectionMiddleware(req, res, next) {
  const matches = [];

  // Inspect query params, URL params, and body — every place user input enters
  scanValue(req.query, matches);
  scanValue(req.params, matches);
  scanValue(req.body, matches);

  const sourceIp = req.headers['x-forwarded-for'] || req.ip;
  const verdict = matches.length > 0 ? 'blocked' : 'allowed';
  const topMatch = matches[0]; // log the first/highest-priority match if multiple

  // Log every request's verdict — not just blocked ones — so your
  // dashboard in Phase 7 can show full traffic, not just attacks
  try {
    await pool.query(
      `INSERT INTO request_logs (source_ip, method, path, payload, verdict, mitre_technique)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sourceIp,
        req.method,
        req.originalUrl,
        JSON.stringify({ query: req.query, body: req.body }),
        verdict,
        topMatch ? topMatch.technique : null
      ]
    );
  } catch (err) {
    console.error('Logging failed:', err);
  }

  if (matches.length > 0) {
    console.log(`[BLOCKED] ${sourceIp} - ${topMatch.name} (${topMatch.technique})`);
    return res.status(403).json({ error: 'Request blocked by security policy' });
  }

  next();
}

module.exports = detectionMiddleware;
