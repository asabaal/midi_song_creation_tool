// src/server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Get the app configuration
const app = require('./app');

// Create a debugging server wrapper
const debugServer = express();

// Add CORS and basic middleware
debugServer.use(cors());
debugServer.use(bodyParser.json({ limit: '10mb' }));

// Debug middleware to see all requests
debugServer.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  console.log(`[DEBUG] Headers:`, req.headers);
  console.log(`[DEBUG] Params:`, req.params);
  console.log(`[DEBUG] Body:`, req.body);
  
  // Add direct pattern handling for each pattern type right at the beginning
  if (req.method === 'POST' && req.url.match(/^\/sessions\/[\w-]+\/patterns\/[\w-]+$/)) {
    const parts = req.url.split('/');
    const sessionId = parts[2];
    const patternType = parts[4];
    
    console.log(`[DEBUG] Detected pattern request: ${patternType} for session ${sessionId}`);
    
    // Import required modules for direct handling
    const { Session } = require('./models/session');
    const { generatePattern } = require('../core/patternGenerator');
    
    // Find the session
    Session.findById(sessionId)
      .then(session => {
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found',
            message: `No session with ID ${sessionId} exists`
          });
        }
        
        console.log(`[DEBUG] Found session: ${session.id}`);
        
        // Generate pattern based on type
        let options = {};
        let notes = [];
        
        if (patternType === 'chord-progression') {
          options = {
            type: 'chord',
            root: req.body.key || 'C',
            octave: parseInt(req.body.octave || 4),
            progression: (req.body.progressionName || 'I-IV-V-I').split('-'),
            chordType: req.body.scaleType || 'major',
            rhythmPattern: req.body.rhythmPattern || [4]
          };
        } else if (patternType === 'bassline') {
          options = {
            type: 'bassline',
            key: req.body.key || 'C',
            octave: parseInt(req.body.octave || 3),
            progression: (req.body.progressionName || 'I-IV-V-I').split('-'),
            style: 'walking',
            rhythmPattern: req.body.rhythmPattern || [1, 0.5, 0.5]
          };
        } else if (patternType === 'drums') {
          options = {
            type: 'drum',
            style: req.body.patternType || 'basic',
            bars: parseInt(req.body.measures || 2)
          };
        }
        
        console.log(`[DEBUG] Generated options:`, options);
        
        // Create a sequence if none exists
        if (!session.getCurrentSequence()) {
          console.log(`[DEBUG] Creating new sequence`);
          session.createSequence({
            name: `Generated ${patternType}`,
            key: 'C major'
          });
        }
        
        // Generate the pattern
        notes = generatePattern(options);
        console.log(`[DEBUG] Generated ${notes.length} notes for ${patternType}`);
        
        // Add notes to the session
        session.addNotes(notes);
        
        const currentSequence = session.getCurrentSequence();
        console.log(`[DEBUG] Added notes to sequence ${currentSequence.id}`);
        
        // Save the session
        return session.save().then(() => {
          res.json({
            success: true,
            message: `Added ${notes.length} notes for ${patternType}`,
            currentSequenceId: session.currentSequenceId,
            noteCount: currentSequence.notes.length
          });
        });
      })
      .catch(error => {
        console.error(`[DEBUG] Error in pattern generation:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
    
    return; // Stop processing - we've handled the request
  }
  
  // For delete notes route
  if (req.method === 'DELETE' && req.url.match(/^\/sessions\/[\w-]+\/notes$/)) {
    const parts = req.url.split('/');
    const sessionId = parts[2];
    
    console.log(`[DEBUG] Detected clear notes request for session ${sessionId}`);
    
    // Import session module for direct handling
    const { Session } = require('./models/session');
    
    // Find the session
    Session.findById(sessionId)
      .then(session => {
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found',
            message: `No session with ID ${sessionId} exists`
          });
        }
        
        console.log(`[DEBUG] Found session for clearing notes: ${session.id}`);
        
        // Clear the notes
        try {
          const prevNotes = session.clearNotes();
          console.log(`[DEBUG] Cleared ${prevNotes.length} notes`);
          
          // Save the session
          return session.save().then(() => {
            res.json({
              success: true,
              message: `Cleared ${prevNotes.length} notes from current sequence`,
              currentSequenceId: session.currentSequenceId
            });
          });
        } catch (error) {
          console.error(`[DEBUG] Error clearing notes:`, error);
          return res.status(400).json({
            success: false,
            error: 'Failed to clear notes',
            message: error.message
          });
        }
      })
      .catch(error => {
        console.error(`[DEBUG] Error in clear notes:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
    
    return; // Stop processing - we've handled the request
  }
  
  // If we didn't handle it directly, forward to the main app
  next();
});

// Use the main app for all other routes
debugServer.use(app);

// Also add a catch-all route at the very end
debugServer.use((req, res) => {
  console.log(`[DEBUG] Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `No route found for ${req.method} ${req.url}`
  });
});

// Start the server
const PORT = process.env.PORT || 3003;
debugServer.listen(PORT, () => {
  console.log(`MIDI Song Creation Tool server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server endpoints available at http://localhost:${PORT}/api`);
  console.log(`Debug mode enabled - all requests will be logged`);
});
