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
const debugRoutes = require('./routes/debugRoutes');

// Make sessions accessible in routes
const { Session, sessions } = require('./models/session');
const { MidiSequence } = require('./models/sequence');
const { generatePattern } = require('../core/patternGenerator');
const midiExport = require('../core/midiExport');

// Create Express app
const app = express();

// Middleware
app.use(cors());

// Custom bodyParser setup with better error handling
app.use((req, res, next) => {
  bodyParser.json({ limit: '10mb' })(req, res, (err) => {
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

// Super detailed debug endpoint
app.get('/api/debug-data', async (req, res) => {
  console.log("===== DEBUG DATA DUMP =====");
  
  // Count all sessions
  console.log(`Total sessions in memory: ${sessions.size}`);
  
  // Get all session IDs
  const sessionIds = Array.from(sessions.keys());
  console.log(`Session IDs: ${sessionIds.join(', ')}`);
  
  // Get detailed info for each session
  const sessionsInfo = [];
  
  for (const sessionId of sessionIds) {
    const session = await Session.findById(sessionId);
    
    if (!session) {
      console.log(`Session ${sessionId} not found!`);
      continue;
    }
    
    const sessionInfo = {
      id: session.id,
      name: session.name,
      hasSequences: Object.keys(session.sequences || {}).length > 0,
      sequenceIds: Object.keys(session.sequences || {}),
      currentSequenceId: session.currentSequenceId,
      hasTracks: (session.tracks || []).length > 0,
      trackIds: (session.tracks || []).map(t => t.id),
      totalNotes: (session.tracks || []).reduce((sum, track) => 
        sum + ((track.notes || []).length), 0),
      notesPerTrack: (session.tracks || []).map(track => ({
        trackId: track.id,
        noteCount: (track.notes || []).length,
        firstFewNotes: (track.notes || []).slice(0, 2)
      }))
    };
    
    console.log(`Session ${sessionId}:`);
    console.log(JSON.stringify(sessionInfo, null, 2));
    
    sessionsInfo.push(sessionInfo);
  }
  
  // Return full debug info
  res.json({
    timestamp: new Date().toISOString(),
    activeSessionCount: sessions.size,
    sessionIds,
    sessionsInfo
  });
});

// Add compatibility router for old API paths (must be before API routes)
app.use('/', compatRouter);

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

// Special compatibility route for getting a session
app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    console.log(`DIRECT SESSION GET HANDLER for: ${req.params.sessionId}`);
    
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Ensure we have at least one sequence
    if (!session.currentSequenceId || !session.getCurrentSequence()) {
      console.log(`No current sequence found in session ${sessionId}, creating one`);
      const newSequence = session.createSequence({
        name: 'New Sequence',
        tempo: session.bpm || 120,
        key: 'C major'
      });
      session.currentSequenceId = newSequence.id;
    }
    
    // NEW: Check all tracks and select a track with notes if current track has none
    if (session.tracks && session.tracks.length > 0) {
      // First, check if current sequence has notes
      const currentSeq = session.getCurrentSequence();
      const currentNoteCount = currentSeq && currentSeq.notes ? currentSeq.notes.length : 0;
      
      // If current sequence has no notes, find one that does
      if (currentNoteCount === 0) {
        console.log(`Current sequence has no notes, checking for sequences with notes...`);
        
        // Find a track with notes to make active
        const trackWithNotes = session.tracks.find(track => 
          track.notes && track.notes.length > 0
        );
        
        if (trackWithNotes) {
          console.log(`Found track ${trackWithNotes.id} with ${trackWithNotes.notes.length} notes, making it current.`);
          session.currentSequenceId = trackWithNotes.id;
        }
      }
    }
    
    // Ensure tracks are synchronized with sequences
    console.log(`Ensuring tracks are synced in session ${sessionId}`);
    if (session.syncAllTracksAndSequences) {
      session.syncAllTracksAndSequences();
    }
    
    // Save any changes made during the sync process
    await session.save();
    
    // Log what is being returned
    console.log(`Returning session with currentSequenceId: ${session.currentSequenceId}`);
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      console.log(`Current track has ${currentTrack.notes ? currentTrack.notes.length : 0} notes`);
    }
    
    // Format the response in the exact way the client expects
    const response = {
      success: true,
      session: {
        id: session.id,
        created: session.createdAt || new Date(),
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences ? session.listSequences() : [],
        tracks: session.tracks || []
      }
    };
    
    console.log(`Response includes ${response.session.tracks.length} tracks and currentSequenceId: ${response.session.currentSequenceId}`);
    
    res.json(response);
  } catch (error) {
    console.error(`Error getting session: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Special compatibility route for sequence creation
app.post('/api/sessions/:sessionId/sequences', (req, res) => {
  // Forward to the session routes handler
  sessionRoutes.handle(req, res);
});

// Special compatibility route for pattern creation
app.post('/api/sessions/:sessionId/patterns/:patternType', (req, res) => {
  console.log(`DIRECT PATTERN HANDLER in app.js for: ${req.params.sessionId}/patterns/${req.params.patternType}`);
  
  // Make sure sessionId is in both params and body
  req.body.sessionId = req.params.sessionId;
  
  // Call the appropriate pattern handler based on pattern type
  switch(req.params.patternType) {
    case 'chord-progression':
      return patternRoutes.handleChordProgression(req, res);
    case 'bassline':
      return patternRoutes.handleBassline(req, res);
    case 'drums':
      return patternRoutes.handleDrums(req, res);
    default:
      return res.status(404).json({
        success: false,
        error: 'Pattern type not found',
        message: `Pattern type '${req.params.patternType}' is not supported`
      });
  }
});

// API routes - these must come AFTER any special route handlers
app.use('/api/debug', debugRoutes);
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
        '/api/export',
        '/api/debug'
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
  console.error('Global error handler:');
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

module.exports = app;