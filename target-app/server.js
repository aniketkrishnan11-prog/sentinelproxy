const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const detectionMiddleware = require('./detection/middleware');
app.use(detectionMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const notesRoutes = require('./routes/notes');
app.use('/api/notes', notesRoutes);

const filesRoutes = require('./routes/files');
app.use('/api/files', filesRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
