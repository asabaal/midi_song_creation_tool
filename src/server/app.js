// src/server/app.js (beginning only - adding debug route)
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

/* REST OF THE FILE REMAINS THE SAME */
