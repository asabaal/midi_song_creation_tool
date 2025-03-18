// src/server/routes/compatRouter.js
const express = require('express');
const router = express.Router();

/**
 * This router provides compatibility with the old API paths
 * by forwarding requests to the new structure
 */

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

// Forward pattern routes - FIXED to directly call pattern routes with sessionId
router.post('/sessions/:sessionId/patterns/:patternType', (req, res) => {
  const { sessionId, patternType } = req.params;
  
  // Get the pattern routes module
  const patternRoutes = require('./patternRoutes');
  
  // Add sessionId to the body if it doesn't exist
  if (!req.body) {
    req.body = {};
  }
  req.body.sessionId = sessionId;
  
  console.log(`Manually forwarding ${req.originalUrl} to pattern route for ${patternType} with sessionId ${sessionId}`);
  
  // Directly call the appropriate route handler based on pattern type
  if (patternType === 'chord-progression') {
    patternRoutes.handleChordProgression(req, res);
  } else if (patternType === 'bassline') {
    patternRoutes.handleBassline(req, res);
  } else if (patternType === 'drums') {
    patternRoutes.handleDrums(req, res);
  } else {
    res.status(404).json({
      success: false,
      error: 'Pattern type not found',
      message: `Pattern type ${patternType} is not supported`
    });
  }
});

// Forward export routes
router.all('/sessions/:sessionId/export/:format', (req, res, next) => {
  const { sessionId, format } = req.params;
  req.url = `/api/export/${format}/${sessionId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward clear notes route
router.delete('/sessions/:sessionId/notes', (req, res, next) => {
  const { sessionId } = req.params;
  const { Session } = require('../models/session');
  
  // Get the session to find the current sequence
  Session.findById(sessionId).then(session => {
    if (!session || !session.currentSequenceId) {
      return res.status(404).json({
        success: false,
        error: 'No current sequence',
        message: 'No current sequence found for the session'
      });
    }
    
    req.url = `/api/sessions/${sessionId}/notes`;
    console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
    next('route');
  }).catch(error => {
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      message: error.message
    });
  });
});

module.exports = router;