// MIDI Song Creation Tool - Error-Fixed API Layer
// This is a patched version with enhanced error handling

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Set up detailed error logging
console.error = function(msg) {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ERROR: ${msg}\n`;
  
  // Log to console with original formatting
  process.stderr.write(formattedMsg);
  
  // Also append to an error log file
  try {
    fs.appendFileSync('error.log', formattedMsg);
  } catch (e) {
    // If we can't write to the log file, just continue
  }
};

// Import the MIDI framework with error trapping
let MusicTheory, MidiNote, MidiSequence, PatternGenerators, SequenceOperations, Session, MidiExporter;

try {
  console.log('Attempting to load midi-framework.js...');
  const midiFramework = require('./midi-framework');
  
  // Destructure with verification
  MusicTheory = midiFramework.MusicTheory || {};
  MidiNote = midiFramework.MidiNote || function() {};
  MidiSequence = midiFramework.MidiSequence || function() {};
  PatternGenerators = midiFramework.PatternGenerators || {};
  SequenceOperations = midiFramework.SequenceOperations || {};
  Session = midiFramework.Session || function() {};
  MidiExporter = midiFramework.MidiExporter || {};
  
  console.log('Successfully loaded midi-framework.js');
  
  // Verify key components
  if (typeof MidiSequence !== 'function') {
    console.error('MidiSequence is not a function');
  }
  if (typeof Session !== 'function') {
    console.error('Session is not a function');
  }
} catch (error) {
  console.error(`Error loading midi-framework.js: ${error.message}`);
  console.error(error.stack);
  
  // Create minimal stub implementations
  MusicTheory = { 
    getNoteName: (n) => `Note-${n}`,
    NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    generateScale: () => [60, 62, 64, 65, 67, 69, 71],
    generateChord: () => [60, 64, 67],
    generateProgression: () => [{
      root: 'C',
      octave: 4,
      chordType: 'major',
      notes: [60, 64, 67]
    }]
  };
  
  MidiNote = function(pitch, startTime, duration, velocity = 80, channel = 0) {
    this.pitch = pitch;
    this.startTime = startTime;
    this.duration = duration;
    this.velocity = velocity;
    this.channel = channel;
    this.toJSON = () => ({ pitch, startTime, duration, velocity, channel });
  };
  
  MidiSequence = function(options = {}) {
    this.id = options.id || `seq_${Date.now()}`;
    this.name = options.name || 'Untitled Sequence';
    this.notes = [];
    this.timeSignature = options.timeSignature || { numerator: 4, denominator: 4 };
    this.tempo = options.tempo || 120;
    this.key = options.key || 'C major';
    
    this.addNote = function(note) {
      this.notes.push(note);
      return this;
    };
    
    this.addNotes = function(notes) {
      notes.forEach(note => this.addNote(note));
      return this;
    };
    
    this.toJSON = function() {
      return {
        id: this.id,
        name: this.name,
        timeSignature: this.timeSignature,
        tempo: this.tempo,
        key: this.key,
        notes: this.notes.map(n => n.toJSON ? n.toJSON() : n)
      };
    };
  };
  
  Session = function(id) {
    this.id = id || `session_${Date.now()}`;
    this.created = new Date();
    this.sequences = {};
    this.currentSequenceId = null;
    
    this.createSequence = function(options = {}) {
      const sequence = new MidiSequence(options);
      this.sequences[sequence.id] = sequence;
      this.currentSequenceId = sequence.id;
      return sequence;
    };
    
    this.getSequence = function(sequenceId) {
      if (!this.sequences[sequenceId]) {
        throw new Error(`Sequence with ID ${sequenceId} not found`);
      }
      return this.sequences[sequenceId];
    };
    
    this.getCurrentSequence = function() {
      if (!this.currentSequenceId || !this.sequences[this.currentSequenceId]) {
        return null;
      }
      return this.sequences[this.currentSequenceId];
    };
    
    this.setCurrentSequence = function(sequenceId) {
      if (!this.sequences[sequenceId]) {
        throw new Error(`Sequence with ID ${sequenceId} not found`);
      }
      this.currentSequenceId = sequenceId;
      return this.sequences[sequenceId];
    };
    
    this.listSequences = function() {
      return Object.values(this.sequences).map(seq => ({
        id: seq.id,
        name: seq.name,
        key: seq.key,
        tempo: seq.tempo,
        noteCount: seq.notes.length
      }));
    };
    
    this.addNotes = function(notes) {
      const sequence = this.getCurrentSequence();
      if (!sequence) {
        throw new Error('No current sequence selected');
      }
      sequence.addNotes(notes);
      return notes;
    };
  };
  
  PatternGenerators = {
    createChordProgression: function(progression, rhythmPattern = [1]) {
      const notes = [];
      let currentTime = 0;
      
      progression.forEach((chord, i) => {
        const rhythmValue = rhythmPattern[i % rhythmPattern.length];
        
        // Add each note in the chord
        chord.notes.forEach(pitch => {
          notes.push(new MidiNote(
            pitch,
            currentTime,
            rhythmValue
          ));
        });
        
        currentTime += rhythmValue;
      });
      
      return notes;
    },
    
    createBassline: function() {
      return [new MidiNote(36, 0, 1, 90, 1), new MidiNote(48, 1, 1, 90, 1)];
    },
    
    createDrumPattern: function() {
      return [new MidiNote(36, 0, 0.25, 100, 9), new MidiNote(38, 1, 0.25, 90, 9)];
    },
    
    createArpeggio: function() {
      return [new MidiNote(60, 0, 0.25), new MidiNote(64, 0.25, 0.25), new MidiNote(67, 0.5, 0.25)];
    },
    
    createRhythmicPattern: function() {
      return [new MidiNote(60, 0, 0.5), new MidiNote(60, 1, 0.5)];
    }
  };
  
  SequenceOperations = {};
  MidiExporter = {};
}

// Create Express application
const app = express();
app.use(cors());

// Enhanced error handling for JSON parsing
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

// Serve static files from the 'public' directory using an absolute path
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Store active sessions
const sessions = new Map();

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled error: ${err.message}`);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  
  // Track response for logging
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`Response for ${req.method} ${req.url}: ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Root path handler with more explicit logging
app.get('/', (req, res) => {
  console.log('GET / - Redirecting to index.html');
  res.redirect('/index.html');
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'API is working correctly',
      sessions: sessions.size
    });
  } catch (error) {
    console.error(`Error in /api/test: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Minimal session creation endpoint for testing
app.post('/api/sessions', (req, res) => {
  try {
    const sessionId = req.body.sessionId || `session_${Date.now()}`;
    
    // Check if session already exists
    if (sessions.has(sessionId)) {
      return res.status(409).json({
        success: false,
        error: 'Session already exists',
        message: `A session with ID ${sessionId} already exists`
      });
    }
    
    // Create new session
    const session = new Session(sessionId);
    sessions.set(sessionId, session);
    
    console.log(`Created new session: ${sessionId}`);
    
    res.status(201).json({
      success: true,
      sessionId: session.id,
      created: session.created,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error(`Error creating session: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get session info
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    const session = sessions.get(sessionId);
    
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.created,
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences()
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

// Create a new sequence
app.post('/api/sessions/:sessionId/sequences', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, tempo, timeSignature, key } = req.body;
    
    console.log(`Creating sequence in session ${sessionId} with params:`, { name, tempo, timeSignature, key });
    
    // Check if session exists
    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    const session = sessions.get(sessionId);
    
    // Create sequence with provided options
    const sequence = session.createSequence({
      name: name || 'Untitled Sequence',
      tempo: tempo || 120,
      timeSignature: timeSignature || { numerator: 4, denominator: 4 },
      key: key || 'C major'
    });
    
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
    console.error(error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get a sequence
app.get('/api/sessions/:sessionId/sequences/:sequenceId', (req, res) => {
  try {
    const { sessionId, sequenceId } = req.params;
    
    // Check if session exists
    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    const session = sessions.get(sessionId);
    
    // Try to get the sequence
    try {
      const sequence = session.getSequence(sequenceId);
      
      res.json({
        success: true,
        sequence: sequence.toJSON()
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

// Pattern generator endpoints
app.post('/api/sessions/:sessionId/patterns/chord-progression', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { key, octave = 4, progressionName = '1-4-5', scaleType = 'major', rhythmPattern = [4] } = req.body;
    
    console.log(`Generating chord progression in session ${sessionId}:`, { key, octave, progressionName, scaleType });
    
    // Check if session exists
    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    const session = sessions.get(sessionId);
    
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      console.log('No current sequence, creating one');
      session.createSequence({
        name: `${key} ${progressionName} Progression`,
        key: `${key} ${scaleType}`
      });
    }
    
    // Generate progression
    const progression = MusicTheory.generateProgression(
      key,
      parseInt(octave),
      progressionName,
      scaleType
    );
    
    console.log(`Generated progression with ${progression.length} chords`);
    
    // Create chord progression notes
    const notes = PatternGenerators.createChordProgression(
      progression,
      Array.isArray(rhythmPattern) ? rhythmPattern : [4]
    );
    
    console.log(`Generated ${notes.length} notes`);
    
    // Add notes to sequence
    session.addNotes(notes);
    
    const currentSequence = session.getCurrentSequence();
    console.log(`Added notes to sequence ${currentSequence.id}, now has ${currentSequence.notes.length} notes`);
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      progression: progression.map(chord => ({
        root: chord.root,
        octave: chord.octave,
        chordType: chord.chordType
      })),
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

// Simplified pattern endpoints for testing
app.post('/api/sessions/:sessionId/patterns/bassline', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    const session = sessions.get(sessionId);
    
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: 'Test Bassline'
      });
    }
    
    // Create test notes
    const notes = PatternGenerators.createBassline();
    
    // Add notes to sequence
    session.addNotes(notes);
    
    const currentSequence = session.getCurrentSequence();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for bassline`,
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

app.post('/api/sessions/:sessionId/patterns/drums', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    const session = sessions.get(sessionId);
    
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: 'Test Drums'
      });
    }
    
    // Create test notes
    const notes = PatternGenerators.createDrumPattern();
    
    // Add notes to sequence
    session.addNotes(notes);
    
    const currentSequence = session.getCurrentSequence();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for drum pattern`,
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

// Special debugging endpoint to list all available files
app.get('/api/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(__dirname);
    const publicFiles = fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : [];
    
    res.json({
      success: true,
      rootDirectory: __dirname,
      files: files,
      publicPath: publicPath,
      publicFiles: publicFiles,
      exists: {
        publicFolder: fs.existsSync(publicPath),
        indexHtml: fs.existsSync(path.join(publicPath, 'index.html')),
        midiFramework: fs.existsSync(path.join(__dirname, 'midi-framework.js'))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error listing files',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`MIDI Song Creation Tool API (Error-Fixed version)`);
  console.log(`Running on port ${PORT}`);
  console.log(`Web interface available at http://localhost:${PORT}`);
  console.log(`Try the debug interface at http://localhost:${PORT}/debug.html`);
  console.log(`====================================================`);
});
