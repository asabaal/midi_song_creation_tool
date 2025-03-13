const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const sessionRoutes = require('./routes/sessionRoutes');
const exportRoutes = require('./routes/exportRoutes');
const patternRoutes = require('./routes/patternRoutes');
const musicTheoryRoutes = require('./routes/musicTheoryRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/music-theory', musicTheoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export the app for testing
module.exports = app;
