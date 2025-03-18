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
// DIRECT ROUTE HANDLERS FOR KEY FUNCTIONALITY
//================================================

// Session creation
app.post('/sessions', async (req, res) => {
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

// Sequence creation
app.post('/sessions/:sessionId/sequences', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, tempo, timeSignature, key } = req.body;
    
    console.log(`Creating sequence in session ${sessionId} with params:`, { name, tempo, timeSignature, key });
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Create sequence
    const sequence = session.createSequence({
      name: name || 'Untitled Sequence',
      tempo: tempo || 120,
      timeSignature: timeSignature || { numerator: 4, denominator: 4 },
      key: key || 'C major'
    });
    
    await session.save();
    
    console.log(`Sequence created: ${sequence.id}`);
    
    res.status(201).json({
      success: true,
      sequenceId: sequence.id,
      message: 'Sequence created successfully',
      sequence: {
        id: sequence.id,
        name: sequence.name,
        tempo: sequence.tempo,
        timeSignature: sequence.timeSignature,
        key: sequence.key
      }
    });
  } catch (error) {
    console.error(`Error creating sequence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Chord progression generation
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
    
    console.log(`Generating chord progression in session ${sessionId} with params:`, { key, octave, progressionName, scaleType });
    
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

// Bassline generation
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
    
    console.log(`Generating bassline in session ${sessionId} with params:`, { key, octave, progressionName, scaleType });
    
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
    
    // Add notes to sequence
    session.addNotes(notes);
    
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

// Drum pattern generation
app.post('/sessions/:sessionId/patterns/drums', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { patternType = 'basic', measures = 2 } = req.body;
    
    console.log(`Generating drum pattern in session ${sessionId} with params:`, { patternType, measures });
    
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
    
    // Add notes to sequence
    session.addNotes(notes);
    
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

// Clear notes from current sequence
app.delete('/sessions/:sessionId/notes', async (req, res) => {
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
    
    // Try to clear notes
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

// Add compatibility router for other paths
app.use('/', compatRouter);

// API routes
app.use('/api/music-theory', musicTheoryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/export', exportRoutes);

// Serve static files
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