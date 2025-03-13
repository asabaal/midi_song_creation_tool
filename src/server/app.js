// src/server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import route modules
const musicTheoryRoutes = require('./routes/musicTheoryRoutes');
// Import other routes as needed

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable URL-encoded paths with special characters
app.set('strict routing', false);
app.enable('case sensitive routing');

// API routes
app.use('/api/music-theory', musicTheoryRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../public')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  // Logger should be used instead of console in production
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

module.exports = app;
