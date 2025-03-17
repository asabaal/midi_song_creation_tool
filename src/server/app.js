// src/server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Import route modules
const musicTheoryRoutes = require('./routes/musicTheoryRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const patternRoutes = require('./routes/patternRoutes');
const exportRoutes = require('./routes/exportRoutes');
const compatRouter = require('./routes/compatRouter');

// Import session service
const sessionService = require('./services/sessionService');

// Create Express app
const app = express();

// Make session service available to all routes through app.locals
app.locals.sessionService = sessionService;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} API Call: ${req.method} ${req.url}`);
  
  // Track response for logging
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      console.log(`${new Date().toLocaleTimeString()} API error (${res.statusCode}): ${data}`);
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Add compatibility router for old API paths (must be before API routes)
app.use('/', compatRouter);

// API routes
app.use('/api/music-theory', musicTheoryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/export', exportRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../public')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });
} else {
  // In development, always serve static files
  app.use(express.static(path.join(__dirname, '../../public')));
  
  // Simple route for development API testing
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'MIDI Song Creation Tool API',
      routes: [
        '/api/sessions',
        '/api/music-theory',
        '/api/patterns',
        '/api/export'
      ]
    });
  });
  
  // Special debug route
  app.get('/api/debug', (req, res) => {
    res.json({
      message: 'Debug information',
      environment: process.env.NODE_ENV || 'development',
      sessionCount: sessionService.sessions.size,
      versions: {
        node: process.version,
        app: '0.2.0'
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  // Logger should be used instead of console in production
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

module.exports = app;
