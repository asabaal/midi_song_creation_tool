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

// Make sessions accessible in routes
const { Session, sessions } = require('./models/session');

// Create Express app
const app = express();

// Middleware
app.use(cors());

// Custom bodyParser setup with better error handling
app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      console.error(`JSON parse error: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid JSON in request body'
      });
    }
    next();
  });
});

app.use(bodyParser.urlencoded({ extended: true }));

// Direct handler for session creation - we define this FIRST before any other routes
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('Creating new session with body:', req.body);
    
    const { name, bpm, timeSignature } = req.body;
    
    const newSession = new Session();
    if (name) newSession.name = name;
    if (bpm) newSession.bpm = bpm;
    if (timeSignature) newSession.timeSignature = timeSignature;
    
    await newSession.save();
    
    console.log(`Created session with ID: ${newSession.id}`);
    
    res.status(201).json({
      success: true,
      sessionId: newSession.id,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error(`Error creating session: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Failed to create session'
    });
  }
});

// Special compatibility route for sequence creation
app.post('/api/sessions/:sessionId/sequences', (req, res) => {
  // Forward to the session routes handler
  sessionRoutes.handle(req, res);
});

// API routes - these must come AFTER any special route handlers
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
      ],
      activeSessions: sessions.size
    });
  });
  
  // Special debug route
  app.get('/api/debug', (req, res) => {
    res.json({
      message: 'Debug information',
      environment: process.env.NODE_ENV || 'development',
      versions: {
        node: process.version,
        app: '0.2.0'
      },
      activeSessions: sessions.size
    });
  });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  // Logger should be used instead of console in production
  // eslint-disable-next-line no-console
  console.error('Global error handler:');
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

module.exports = app;
