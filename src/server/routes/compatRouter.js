// src/server/routes/compatRouter.js
const express = require('express');
const router = express.Router();

/**
 * This router provides compatibility with the old API paths
 * by forwarding requests to the new structure
 */

// Debug helper to log request details
function logRequest(req, prefix = 'DEBUG') {
  console.log(`[${prefix}] ${req.method} ${req.originalUrl}`);
  console.log(`[${prefix}] Headers:`, req.headers);
  console.log(`[${prefix}] Body:`, req.body);
  console.log(`[${prefix}] Params:`, req.params);
  console.log(`[${prefix}] Query:`, req.query);
}

// Forward session routes for GET requests
router.get('/sessions/:sessionId', (req, res, next) => {
  // Rewrite the URL to match the new structure
  req.url = `/api/sessions/${req.params.sessionId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward session sequence routes
router.all('/sessions/:sessionId/sequences', (req, res, next) => {
  req.url = `/api/sessions/${req.params.sessionId}/sequences`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward sequence get route
router.all('/sessions/:sessionId/sequences/:sequenceId', (req, res, next) => {
  req.url = `/api/sessions/${req.params.sessionId}/sequences/${req.params.sequenceId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// DIRECT HANDLING: Chord progression route
router.post('/sessions/:sessionId/patterns/chord-progression', (req, res) => {
  console.log('DIRECT HANDLING of chord progression');
  logRequest(req, 'CHORD-PROGRESSION');
  
  const { sessionId } = req.params;
  
  // Create a new request object with the sessionId in the body
  if (!req.body) {
    req.body = {};
  }
  req.body.sessionId = sessionId;
  
  // Import the required modules
  const { Session } = require('../models/session');
  const { generatePattern } = require('../../core/patternGenerator');
  
  // Default parameter values
  const key = req.body.key || 'C';
  const octave = req.body.octave || 4;
  const progressionName = req.body.progressionName || 'I-IV-V-I';
  const scaleType = req.body.scaleType || 'major';
  const rhythmPattern = req.body.rhythmPattern || [4];
  
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
      
      // Generate the chord progression
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
      
      // Find or create a track for the notes
      if (!session.tracks) {
        session.tracks = [];
      }
      
      let track;
      if (session.tracks.length === 0) {
        track = {
          id: '1',
          name: 'Chord Progression',
          instrument: 0,
          notes: []
        };
        session.tracks.push(track);
      } else {
        track = session.tracks[0];
      }
      
      // Add notes to the track
      if (!track.notes) {
        track.notes = [];
      }
      track.notes = track.notes.concat(notes);
      
      // Update the sequence
      if (session.sequences) {
        if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
          session.sequences[session.currentSequenceId].notes = track.notes;
        }
      }
      
      // Save the session
      return session.save().then(() => {
        res.json({
          success: true,
          message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
          sessionId: session.id,
          currentSequenceId: session.currentSequenceId,
          noteCount: track.notes.length
        });
      });
    })
    .catch(error => {
      console.error('Error generating chord progression:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

// DIRECT HANDLING: Bassline route
router.post('/sessions/:sessionId/patterns/bassline', (req, res) => {
  console.log('DIRECT HANDLING of bassline');
  logRequest(req, 'BASSLINE');
  
  const { sessionId } = req.params;
  
  // Create a new request object with the sessionId in the body
  if (!req.body) {
    req.body = {};
  }
  req.body.sessionId = sessionId;
  
  // Import the required modules
  const { Session } = require('../models/session');
  const { generatePattern } = require('../../core/patternGenerator');
  
  // Default parameter values
  const key = req.body.key || 'C';
  const octave = req.body.octave || 3;
  const progressionName = req.body.progressionName || 'I-IV-V-I';
  const scaleType = req.body.scaleType || 'major';
  const rhythmPattern = req.body.rhythmPattern || [1, 0.5, 0.5];
  
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
      
      // Generate the bassline
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
      
      // Find or create a track for the notes
      if (!session.tracks) {
        session.tracks = [];
      }
      
      let track = session.tracks.find(t => t.instrument === 32);
      if (!track) {
        track = {
          id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
          name: 'Bassline',
          instrument: 32,
          notes: []
        };
        session.tracks.push(track);
      }
      
      // Add notes to the track
      if (!track.notes) {
        track.notes = [];
      }
      track.notes = track.notes.concat(notes);
      
      // Update the sequence
      if (session.sequences) {
        if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
          session.sequences[session.currentSequenceId].notes = track.notes;
        }
      }
      
      // Save the session
      return session.save().then(() => {
        res.json({
          success: true,
          message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
          sessionId: session.id,
          currentSequenceId: session.currentSequenceId,
          noteCount: track.notes.length
        });
      });
    })
    .catch(error => {
      console.error('Error generating bassline:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

// DIRECT HANDLING: Drums route
router.post('/sessions/:sessionId/patterns/drums', (req, res) => {
  console.log('DIRECT HANDLING of drums');
  logRequest(req, 'DRUMS');
  
  const { sessionId } = req.params;
  
  // Create a new request object with the sessionId in the body
  if (!req.body) {
    req.body = {};
  }
  req.body.sessionId = sessionId;
  
  // Import the required modules
  const { Session } = require('../models/session');
  const { generatePattern } = require('../../core/patternGenerator');
  
  // Default parameter values
  const patternType = req.body.patternType || 'basic';
  const measures = req.body.measures || 2;
  
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
      
      // Generate the drum pattern
      const options = {
        type: 'drum',
        style: patternType,
        bars: parseInt(measures) || 2
      };
      
      const notes = generatePattern(options);
      console.log(`Generated ${notes.length} notes for drums`);
      
      // Find or create a track for the notes
      if (!session.tracks) {
        session.tracks = [];
      }
      
      let track = session.tracks.find(t => t.instrument === 9);
      if (!track) {
        track = {
          id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
          name: 'Drums',
          instrument: 9,
          notes: []
        };
        session.tracks.push(track);
      }
      
      // Add notes to the track
      if (!track.notes) {
        track.notes = [];
      }
      track.notes = track.notes.concat(notes);
      
      // Update the sequence
      if (session.sequences) {
        if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
          session.sequences[session.currentSequenceId].notes = track.notes;
        }
      }
      
      // Save the session
      return session.save().then(() => {
        res.json({
          success: true,
          message: `Added ${notes.length} notes for ${patternType} drum pattern`,
          sessionId: session.id,
          currentSequenceId: session.currentSequenceId,
          noteCount: track.notes.length
        });
      });
    })
    .catch(error => {
      console.error('Error generating drums:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

// DIRECT HANDLING: Clear notes route
router.delete('/sessions/:sessionId/notes', (req, res) => {
  console.log('DIRECT HANDLING of clear notes');
  logRequest(req, 'CLEAR-NOTES');
  
  const { sessionId } = req.params;
  const { Session } = require('../models/session');
  
  // Get the session to find the current sequence
  Session.findById(sessionId).then(session => {
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Clear notes from the current sequence
    if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      const sequence = session.sequences[session.currentSequenceId];
      const previousNotesCount = sequence.notes ? sequence.notes.length : 0;
      sequence.notes = [];
      
      // Also clear notes from corresponding track if it exists
      if (session.tracks) {
        const track = session.tracks.find(t => t.id === session.currentSequenceId);
        if (track) {
          track.notes = [];
        }
      }
      
      session.save().then(() => {
        res.json({
          success: true,
          message: `Cleared ${previousNotesCount} notes from current sequence`,
          currentSequenceId: session.currentSequenceId
        });
      }).catch(error => {
        res.status(500).json({
          success: false,
          error: 'Failed to save session',
          message: error.message
        });
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No current sequence',
        message: 'No current sequence found for the session'
      });
    }
  }).catch(error => {
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      message: error.message
    });
  });
});

// Export the router
module.exports = router;