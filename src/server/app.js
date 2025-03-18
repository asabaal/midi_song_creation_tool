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

//================================================
// CRITICAL: GET SESSION HANDLER FOR WEB UI
//================================================

// This is the critical endpoint the web UI uses to fetch the notes
app.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`[GET /sessions/${sessionId}] Getting session for web UI`);
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // CRITICAL: Ensure tracks are synchronized with sequence notes
    // If session has sequences with notes but tracks don't match, sync them
    if (session.sequences && session.currentSequenceId && session.sequences[session.currentSequenceId]) {
      const currentSequence = session.sequences[session.currentSequenceId];
      
      // Verify the currentSequence has notes
      if (currentSequence.notes && currentSequence.notes.length > 0) {
        console.log(`[GET /sessions/${sessionId}] Current sequence has ${currentSequence.notes.length} notes`);
        
        // Force sync all tracks with their sequences
        if (typeof session._syncTrackWithSequence === 'function') {
          session._syncTrackWithSequence(currentSequence);
          console.log(`[GET /sessions/${sessionId}] Synchronized tracks with sequences`);
        } else {
          console.warn(`[GET /sessions/${sessionId}] Session synchronization method not available`);
        }
      }
    } else {
      console.log(`[GET /sessions/${sessionId}] No current sequence found`);
    }
    
    // Count the number of notes in all tracks for logging
    const totalNotes = session.tracks ? 
      session.tracks.reduce((sum, track) => sum + (track.notes ? track.notes.length : 0), 0) : 0;
    console.log(`[GET /sessions/${sessionId}] Session has ${session.tracks ? session.tracks.length : 0} tracks with a total of ${totalNotes} notes`);
    
    // Save any updates we've made to the session
    await session.save();
    
    // For debugging - check we actually have notes to return
    if (totalNotes === 0 && session.sequences && session.currentSequenceId) {
      const seq = session.sequences[session.currentSequenceId];
      if (seq && seq.notes && seq.notes.length > 0) {
        console.warn(`[GET /sessions/${sessionId}] WARNING: Sequence has ${seq.notes.length} notes but tracks have 0!`);
      }
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.createdAt,
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences(),
        tracks: session.tracks || []
      }
    });
  } catch (error) {
    console.error(`Error getting session: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

//================================================
// DIRECT ROUTE HANDLERS FOR API PREFIXED ROUTES
//================================================

// API test endpoint - specifically for the debug interface
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    sessions: sessions.size
  });
});

// Get Session (for debug interface)
app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`DEBUG: Getting session ${sessionId} from API-prefixed route`);
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Ensure tracks are synchronized with sequences
    if (session.sequences && session.currentSequenceId && session.sequences[session.currentSequenceId]) {
      const currentSequence = session.sequences[session.currentSequenceId];
      if (typeof session._syncTrackWithSequence === 'function') {
        session._syncTrackWithSequence(currentSequence);
      }
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.createdAt,
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences(),
        tracks: session.tracks || []
      }
    });
  } catch (error) {
    console.error(`Error getting session: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get Sequence (for debug interface)
app.get('/api/sessions/:sessionId/sequences/:sequenceId', async (req, res) => {
  try {
    const { sessionId, sequenceId } = req.params;
    console.log(`DEBUG: Getting sequence ${sequenceId} from session ${sessionId} from API-prefixed route`);
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    try {
      const sequence = session.getSequence(sequenceId);
      
      res.json({
        success: true,
        sequence: sequence.toJSON ? sequence.toJSON() : sequence
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: 'Sequence not found',
        message: error.message
      });
    }
  } catch (error) {
    console.error(`Error getting sequence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API-prefixed Chord progression generation
app.post('/api/sessions/:sessionId/patterns/chord-progression', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4] 
    } = req.body;
    
    console.log(`DEBUG: Generating chord progression in session ${sessionId} with API-prefixed route`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create a sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one');
      session.createSequence({
        name: `${key} ${progressionName} Progression`,
        key: `${key} ${scaleType}`
      });
    }
    
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
    console.log(`Generated ${notes.length} notes for chord progression`);
    
    // Add notes to sequence
    session.addNotes(notes);
    
    // Update track metadata for proper display in UI
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      currentTrack.instrument = 0; // Piano instrument (for chords)
      currentTrack.name = `${key} ${progressionName} Progression`;
    }
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      progression: progressionName,
      currentSequenceId: session.currentSequenceId,
      noteCount: currentSequence.notes.length
    });
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API-prefixed Bassline generation
app.post('/api/sessions/:sessionId/patterns/bassline', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5] 
    } = req.body;
    
    console.log(`DEBUG: Generating bassline in session ${sessionId} with API-prefixed route`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create a sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one for bassline');
      session.createSequence({
        name: `${key} ${progressionName} Bassline`,
        key: `${key} ${scaleType}`
      });
    }
    
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
    console.log(`Generated ${notes.length} notes for bassline`);
    
    // Add notes to sequence with channel 1 for bass
    const bassNotes = notes.map(note => ({
      ...note,
      channel: 1 // Important: Set channel to 1 for bassline
    }));
    
    session.addNotes(bassNotes);
    
    // Update track metadata for proper display in UI
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      currentTrack.instrument = 32; // Bass instrument
      currentTrack.name = `${key} ${progressionName} Bassline`;
    }
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      currentSequenceId: session.currentSequenceId,
      noteCount: currentSequence.notes.length
    });
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API-prefixed Drum pattern generation
app.post('/api/sessions/:sessionId/patterns/drums', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { patternType = 'basic', measures = 2 } = req.body;
    
    console.log(`DEBUG: Generating drum pattern in session ${sessionId} with API-prefixed route`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create a sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one for drums');
      session.createSequence({
        name: `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`,
        key: 'C major'  // Key doesn't matter for drums
      });
    }
    
    // Generate drum pattern
    const options = {
      type: 'drum',
      style: patternType,
      bars: parseInt(measures) || 2
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for drum pattern`);
    
    // Add notes to sequence with channel 9 for drums (important for UI)
    const drumNotes = notes.map(note => ({
      ...note,
      channel: 9 // MIDI channel 10 (9 in zero-based) is for drums
    }));
    
    session.addNotes(drumNotes);
    
    // Update track metadata for proper display in UI
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      currentTrack.instrument = 9; // Drum kit
      currentTrack.name = `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`;
    }
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      currentSequenceId: session.currentSequenceId,
      noteCount: currentSequence.notes.length
    });
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API-prefixed Clear notes from current sequence
app.delete('/api/sessions/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`DEBUG: Clearing notes from session ${sessionId} with API-prefixed route`);
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    try {
      const previousNotes = session.clearNotes();
      
      console.log(`Cleared ${previousNotes.length} notes from session ${sessionId}`);
      
      await session.save();
      
      res.json({
        success: true,
        message: `Cleared ${previousNotes.length} notes from current sequence`,
        currentSequenceId: session.currentSequenceId
      });
    } catch (error) {
      console.error(`Error clearing notes: ${error.message}`);
      res.status(400).json({
        success: false,
        error: 'Failed to clear notes',
        message: error.message
      });
    }
  } catch (error) {
    console.error(`Error in clear notes endpoint: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

//================================================
// DIRECT ROUTE HANDLERS FOR NON-API PREFIXED ROUTES (FOR WEB UI)
//================================================

// Chord progression generation - direct handler for web UI
app.post('/sessions/:sessionId/patterns/chord-progression', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4] 
    } = req.body;
    
    console.log(`DEBUG: Generating chord progression in session ${sessionId} with non-API-prefixed route`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create a sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one');
      session.createSequence({
        name: `${key} ${progressionName} Progression`,
        key: `${key} ${scaleType}`
      });
    }
    
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
    console.log(`Generated ${notes.length} notes for chord progression`);
    
    // Add notes to sequence
    session.addNotes(notes);
    
    // Update track metadata for proper display in UI
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      currentTrack.instrument = 0; // Piano instrument (for chords)
      currentTrack.name = `${key} ${progressionName} Progression`;
    }
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      progression: progressionName,
      currentSequenceId: session.currentSequenceId,
      noteCount: currentSequence.notes.length
    });
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Bassline generation - direct handler for web UI
app.post('/sessions/:sessionId/patterns/bassline', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5] 
    } = req.body;
    
    console.log(`DEBUG: Generating bassline in session ${sessionId} with non-API-prefixed route`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create a sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one for bassline');
      session.createSequence({
        name: `${key} ${progressionName} Bassline`,
        key: `${key} ${scaleType}`
      });
    }
    
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
    console.log(`Generated ${notes.length} notes for bassline`);
    
    // Add notes to sequence with channel 1 for bass
    const bassNotes = notes.map(note => ({
      ...note,
      channel: 1 // Important: Set channel to 1 for bassline
    }));
    
    session.addNotes(bassNotes);
    
    // Update track metadata for proper display in UI
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      currentTrack.instrument = 32; // Bass instrument
      currentTrack.name = `${key} ${progressionName} Bassline`;
    }
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      currentSequenceId: session.currentSequenceId,
      noteCount: currentSequence.notes.length
    });
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Drum pattern generation - direct handler for web UI
app.post('/sessions/:sessionId/patterns/drums', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { patternType = 'basic', measures = 2 } = req.body;
    
    console.log(`DEBUG: Generating drum pattern in session ${sessionId} with non-API-prefixed route`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create a sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one for drums');
      session.createSequence({
        name: `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`,
        key: 'C major'  // Key doesn't matter for drums
      });
    }
    
    // Generate drum pattern
    const options = {
      type: 'drum',
      style: patternType,
      bars: parseInt(measures) || 2
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for drum pattern`);
    
    // Add notes to sequence with channel 9 for drums (important for UI)
    const drumNotes = notes.map(note => ({
      ...note,
      channel: 9 // MIDI channel 10 (9 in zero-based) is for drums
    }));
    
    session.addNotes(drumNotes);
    
    // Update track metadata for proper display in UI
    const currentTrack = session.tracks.find(t => t.id === session.currentSequenceId);
    if (currentTrack) {
      currentTrack.instrument = 9; // Drum kit
      currentTrack.name = `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`;
    }
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      currentSequenceId: session.currentSequenceId,
      noteCount: currentSequence.notes.length
    });
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Clear notes from current sequence - direct handler for web UI
app.delete('/sessions/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`DEBUG: Clearing notes from session ${sessionId} with non-API-prefixed route`);
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    try {
      const previousNotes = session.clearNotes();
      
      console.log(`Cleared ${previousNotes.length} notes from session ${sessionId}`);
      
      await session.save();
      
      res.json({
        success: true,
        message: `Cleared ${previousNotes.length} notes from current sequence`,
        currentSequenceId: session.currentSequenceId
      });
    } catch (error) {
      console.error(`Error clearing notes: ${error.message}`);
      res.status(400).json({
        success: false,
        error: 'Failed to clear notes',
        message: error.message
      });
    }
  } catch (error) {
    console.error(`Error in clear notes endpoint: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

//================================================
// STANDARD ROUTES 
//================================================

// Direct handler for session creation - we need this
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('Creating new session with body:', req.body);
    
    const { name, bpm, timeSignature } = req.body;
    
    const newSession = new Session({
      name: name || 'New Session',
      bpm: bpm || 120,
      timeSignature: timeSignature || [4, 4]
    });
    
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

// Add compatibility router for other paths
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