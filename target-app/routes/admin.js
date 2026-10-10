// routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

// VULNERABLE: trusts req.body.role instead of the verified token's role
router.get('/users', requireAuth, async (req, res) => {
  const { role } = req.body; // client-controlled — this is the bug

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users'
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
