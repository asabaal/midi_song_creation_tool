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
const { generatePattern } = require('../core/patternGenerator');

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

// Special handler for the chord progression pattern through sessions API
app.post('/api/sessions/:sessionId/patterns/chord-progression', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Creating chord progression for session ${sessionId}`);
    
    // Merge URL parameters with body
    const requestBody = {
      ...req.body,
      sessionId: sessionId
    };
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Extract parameters
    const { 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4] 
    } = requestBody;
    
    // Generate chord progression pattern
    const options = {
      type: 'chord',
      root: key,
      octave: parseInt(octave),
      progression: progressionName.split('-'),
      chordType: scaleType,
      rhythmPattern: Array.isArray(rhythmPattern) ? rhythmPattern : [4]
    };
    
    const notes = generatePattern(options);
    
    // Find or create the first track to store chord notes
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    if (session.tracks.length === 0) {
      // Create a new track
      track = {
        id: '1',
        name: 'Chord Progression',
        instrument: 0,
        notes: []
      };
      session.tracks.push(track);
    } else {
      // Use the first track
      track = session.tracks[0];
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Special handler for the bassline pattern through sessions API
app.post('/api/sessions/:sessionId/patterns/bassline', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Creating bassline for session ${sessionId}`);
    
    // Merge URL parameters with body
    const requestBody = {
      ...req.body,
      sessionId: sessionId
    };
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Extract parameters
    const { 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5] 
    } = requestBody;
    
    // Generate bassline pattern
    const options = {
      type: 'bassline',
      key: key,
      octave: parseInt(octave),
      progression: progressionName.split('-'),
      style: 'walking',
      rhythmPattern: Array.isArray(rhythmPattern) ? rhythmPattern : [1, 0.5, 0.5]
    };
    
    const notes = generatePattern(options);
    
    // Find or create a bass track
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    // Look for an existing bass track
    track = session.tracks.find(t => t.instrument === 32);
    
    if (!track) {
      // Create a new track if none exists
      track = {
        id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
        name: 'Bassline',
        instrument: 32,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Special handler for the drums pattern through sessions API
app.post('/api/sessions/:sessionId/patterns/drums', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Creating drum pattern for session ${sessionId}`);
    
    // Merge URL parameters with body
    const requestBody = {
      ...req.body,
      sessionId: sessionId
    };
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Extract parameters
    const { 
      patternType = 'basic', 
      measures = 2 
    } = requestBody;
    
    // Generate drum pattern
    const options = {
      type: 'drum',
      style: patternType,
      bars: parseInt(measures) || 2
    };
    
    const notes = generatePattern(options);
    
    // Find or create a drum track
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    // Look for an existing drum track
    track = session.tracks.find(t => t.instrument === 9);
    
    if (!track) {
      // Create a new track if none exists
      track = {
        id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
        name: 'Drums',
        instrument: 9,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Special handler for clearing notes
app.delete('/api/sessions/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Check if there are tracks
    if (!session.tracks || session.tracks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No tracks to clear',
        message: 'No tracks found in the session to clear notes from'
      });
    }
    
    // Clear notes from all tracks
    let totalNotes = 0;
    for (const track of session.tracks) {
      totalNotes += track.notes ? track.notes.length : 0;
      track.notes = [];
    }
    
    await session.save();
    
    return res.json({
      success: true,
      message: `Cleared ${totalNotes} notes from all tracks`,
      currentSequenceId: session.tracks[0].id
    });
  } catch (error) {
    console.error(`Error clearing notes: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
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
