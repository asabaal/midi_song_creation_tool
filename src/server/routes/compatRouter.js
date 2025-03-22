// src/server/routes/compatRouter.js
const express = require('express');
const router = express.Router();

/**
 * This router provides compatibility with the old API paths
 * by forwarding requests to the new structure
 */

// Debug logging helper
function logCompatRequest(location, req) {
  console.log(`\n=== DEBUG COMPAT ROUTER: ${location} ===`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Path: ${req.path}`);
  console.log(`Method: ${req.method}`);
  console.log(`Params: ${JSON.stringify(req.params)}`);
  console.log(`Body: ${JSON.stringify(req.body || {})}`);
  console.log(`Query: ${JSON.stringify(req.query || {})}`);
}

// Debug logging for all requests through compat router
router.use((req, res, next) => {
  console.log(`\n=== DEBUG COMPAT ROUTER: ${req.method} ${req.originalUrl} ===`);
  next();
});

// Forward session routes for GET requests
router.get('/sessions/:sessionId', (req, res, next) => {
  logCompatRequest('GET /sessions/:sessionId', req);
  
  // Rewrite the URL to match the new structure
  req.url = `/api/sessions/${req.params.sessionId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward session routes for PUT requests
router.put('/sessions/:sessionId', (req, res, next) => {
  logCompatRequest('PUT /sessions/:sessionId', req);
  
  // Rewrite the URL to match the new structure
  req.url = `/api/sessions/${req.params.sessionId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward session create route
router.post('/sessions', (req, res, next) => {
  logCompatRequest('POST /sessions', req);
  
  // Rewrite the URL to match the new structure
  req.url = `/api/sessions`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward session sequence routes
router.all('/sessions/:sessionId/sequences', (req, res, next) => {
  logCompatRequest('ALL /sessions/:sessionId/sequences', req);
  
  req.url = `/api/sessions/${req.params.sessionId}/sequences`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward sequence get route
router.all('/sessions/:sessionId/sequences/:sequenceId', (req, res, next) => {
  logCompatRequest('ALL /sessions/:sessionId/sequences/:sequenceId', req);
  
  req.url = `/api/sessions/${req.params.sessionId}/sequences/${req.params.sequenceId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// DIRECT APPROACH: Make a direct API call to pattern routes
router.post('/sessions/:sessionId/patterns/:patternType', (req, res) => {
  const { sessionId, patternType } = req.params;
  
  console.log(`\n=== DIRECT PATTERN HANDLING IN COMPAT ROUTER ===`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Session ID from params: ${sessionId}`);
  console.log(`Pattern Type: ${patternType}`);
  
  // Import pattern handlers directly
  const patternRoutes = require('./patternRoutes');
  
  // Create a completely new request object
  const newReq = {
    originalUrl: `/api/patterns/${patternType}/${sessionId}`,
    path: `/api/patterns/${patternType}/${sessionId}`,
    method: 'POST',
    headers: req.headers,
    params: { 
      sessionId: sessionId,
      patternType: patternType
    },
    body: {
      ...req.body,
      sessionId: sessionId  // Explicitly add sessionId
    },
    query: {
      sessionId: sessionId  // Add to query params too for maximum compatibility
    }
  };
  
  console.log(`\n=== DIRECT CALL TO PATTERN HANDLER ===`);
  console.log(`Request params: ${JSON.stringify(newReq.params)}`);
  console.log(`Request body: ${JSON.stringify(newReq.body)}`);
  
  // Call the appropriate handler function directly
  try {
    switch (patternType) {
      case 'chord-progression':
        console.log('Calling chord progression handler directly');
        return patternRoutes.handleChordProgression(newReq, res);
      case 'bassline':
        console.log('Calling bassline handler directly');
        return patternRoutes.handleBassline(newReq, res);
      case 'drums':
        console.log('Calling drums handler directly');
        return patternRoutes.handleDrums(newReq, res);
      default:
        console.error(`Unsupported pattern type: ${patternType}`);
        return res.status(404).json({
          success: false,
          error: 'Unsupported pattern type',
          message: `Pattern type '${patternType}' is not supported`
        });
    }
  } catch (error) {
    console.error(`ERROR direct calling pattern handler: ${error.message}`);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
});

// Forward export routes
router.all('/sessions/:sessionId/export/:format', (req, res, next) => {
  logCompatRequest('ALL /sessions/:sessionId/export/:format', req);
  
  const { sessionId, format } = req.params;
  req.url = `/api/export/${format}/${sessionId}`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

// Forward clear notes route
router.delete('/sessions/:sessionId/notes', (req, res) => {
  const { sessionId } = req.params;
  
  logCompatRequest(`DELETE /sessions/${sessionId}/notes`, req);
  
  const { Session } = require('../models/session');
  
  // Ensure both params and body have the sessionId
  if (!req.body) {
    req.body = {};
  }
  req.body.sessionId = sessionId;
  
  console.log(`Clear notes request for session: ${sessionId}`);
  
  // Get the session to find the current sequence
  Session.findById(sessionId).then(session => {
    if (!session) {
      console.error(`DEBUG: Session not found with ID ${sessionId}`);
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    if (!session.currentSequenceId) {
      console.error(`DEBUG: No current sequence in session ${sessionId}`);
      return res.status(404).json({
        success: false,
        error: 'No current sequence',
        message: 'No current sequence found for the session'
      });
    }
    
    // Call the clearNotes method on the session
    try {
      const previousNotes = session.clearNotes();
      session.save().then(() => {
        res.json({
          success: true,
          message: `Cleared ${previousNotes.length} notes from current sequence`,
          currentSequenceId: session.currentSequenceId
        });
      });
    } catch (error) {
      console.error(`DEBUG: Error clearing notes: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to clear notes',
        message: error.message
      });
    }
  }).catch(error => {
    console.error(`DEBUG: Error finding session: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      message: error.message
    });
  });
});

// Forward import route
router.post('/sessions/:sessionId/import', (req, res, next) => {
  const { sessionId } = req.params;
  logCompatRequest(`POST /sessions/${sessionId}/import`, req);
  
  // Add sessionId to the body
  if (!req.body) {
    req.body = {};
  }
  req.body.sessionId = sessionId;
  
  req.url = `/api/sessions/${sessionId}/import`;
  console.log(`Redirecting ${req.originalUrl} to ${req.url}`);
  next('route');
});

module.exports = router;