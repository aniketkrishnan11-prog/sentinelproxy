const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

// CREATE — secure, parameterized
router.post('/', requireAuth, async (req, res) => {
  const { title, content, is_private } = req.body;
  const user_id = req.user.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, is_private) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, content, is_private ?? true]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// LIST — secure, scoped to logged-in user
router.get('/', requireAuth, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json({ notes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// SEARCH — VULNERABLE: SQL injection via string concatenation
// Must come before /:id or Express will treat "search" as an id value
router.get('/search/query', requireAuth, async (req, res) => {
  const { q } = req.query;

  try {
    const queryText = `SELECT * FROM notes WHERE title ILIKE '%${q}%'`;
    const result = await pool.query(queryText);
    res.json({ notes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET BY ID — VULNERABLE: IDOR, no ownership check
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

module.exports = router;
