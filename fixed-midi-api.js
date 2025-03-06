// MIDI Song Creation Tool - API Layer (Fixed version)
// This implements the API endpoints for Claude to interact with the MIDI framework

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import the MIDI framework
let midiFramework;
try {
  midiFramework = require('./midi-framework');
  console.log('Successfully imported midi-framework.js');
} catch (error) {
  console.error('Error importing midi-framework.js:', error);
  // Create a simplified version of the framework for testing
  midiFramework = {
    MusicTheory: { getNoteName: (n) => `Note-${n}` },
    MidiNote: function(pitch, startTime, duration, velocity = 80, channel = 0) {
      this.pitch = pitch;
      this.startTime = startTime;
      this.duration = duration;
      this.velocity = velocity;
      this.channel = channel;
    },
    MidiSequence: function() { this.notes = []; },
    PatternGenerators: {},
    SequenceOperations: {},
    Session: function(id) { 
      this.id = id; 
      this.created = new Date();
      this.currentSequenceId = null;
      this.listSequences = () => [];
    },
    MidiExporter: {}
  };
}

const { 
  MusicTheory, 
  MidiNote, 
  MidiSequence, 
  PatternGenerators, 
  SequenceOperations, 
  Session, 
  MidiExporter 
} = midiFramework;

// Create Express application
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory using an absolute path
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Store active sessions
const sessions = new Map();

// Root path handler with more explicit logging
app.get('/', (req, res) => {
  console.log('GET / - Redirecting to index.html');
  res.redirect('/index.html');
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    sessions: sessions.size
  });
});

// Minimal session creation endpoint for testing
app.post('/api/sessions', (req, res) => {
  const sessionId = req.body.sessionId || `session_${Date.now()}`;
  
  // Check if session already exists
  if (sessions.has(sessionId)) {
    return res.status(409).json({
      success: false,
      error: 'Session already exists',
      message: `A session with ID ${sessionId} already exists`
    });
  }
  
  try {
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
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Special debugging endpoint to list all available files
app.get('/api/debug/files', (req, res) => {
  const fs = require('fs');
  
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
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`MIDI Song Creation Tool API (fixed version) running on port ${PORT}`);
  console.log(`Web interface available at http://localhost:${PORT}`);
  console.log(`Try the test endpoint at http://localhost:${PORT}/api/test`);
  console.log(`Debug files at http://localhost:${PORT}/api/debug/files`);
});

module.exports = app;