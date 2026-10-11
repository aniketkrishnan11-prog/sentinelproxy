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

  // Catch the WAF-bypass case: a POST/PUT/PATCH that should have a
  // JSON body but doesn't (missing or malformed Content-Type) — don't
  // silently let it through just because there's nothing to scan.
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body === undefined) {
    matches.push({ name: 'Missing/malformed body on write request', technique: 'T1027' });
  }

  scanValue(req.query, matches);
  scanValue(req.params, matches);
  scanValue(req.body, matches);

  const sourceIp = req.headers['x-forwarded-for'] || req.ip;
  const verdict = matches.length > 0 ? 'blocked' : 'allowed';
  const topMatch = matches[0];

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
