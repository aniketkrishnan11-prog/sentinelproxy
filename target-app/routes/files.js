const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

// VULNERABLE: storage config uses the user-supplied original filename directly,
// with no sanitization and no check on file extension/type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Using originalname directly — this is the bug.
    // A filename like "../../../../etc/passwd" or containing path
    // separators will be honored as-is by some OS/filesystem combos,
    // and even where the OS blocks true traversal, there's still no
    // extension allowlist — .php, .sh, .html all get accepted and stored.
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO files (user_id, original_filename, stored_path) VALUES ($1, $2, $3) RETURNING *',
      [user_id, req.file.originalname, req.file.path]
    );
    res.status(201).json({ file: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
