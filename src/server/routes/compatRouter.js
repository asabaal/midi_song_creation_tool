// src/server/routes/compatRouter.js
const express = require('express');
const router = express.Router();

/**
 * This router provides compatibility with the old API paths
 * by forwarding requests to the new structure
 */

// Forward session routes
router.all('/sessions/:sessionId', (req, res, next) => {
  // Rewrite the URL to match the new structure
  req.url = `/api/sessions/${req.params.sessionId}`;
  next('route');
});

// Forward session sequence routes
router.all('/sessions/:sessionId/sequences', (req, res, next) => {
  req.url = `/api/sessions/${req.params.sessionId}/sequences`;
  next('route');
});

// Forward sequence get route
router.all('/sessions/:sessionId/sequences/:sequenceId', (req, res, next) => {
  req.url = `/api/sessions/${req.params.sessionId}/sequences/${req.params.sequenceId}`;
  next('route');
});

// Forward pattern routes
router.all('/sessions/:sessionId/patterns/:patternType', (req, res, next) => {
  const { sessionId, patternType } = req.params;
  
  // For POST requests, we need to inject the sessionId into the body
  if (req.method === 'POST') {
    req.url = `/api/patterns/${patternType}`;
    req.body.sessionId = sessionId;
  } else {
    req.url = `/api/sessions/${sessionId}/patterns/${patternType}`;
  }
  
  next('route');
});

// Forward export routes
router.all('/sessions/:sessionId/export/:format', (req, res, next) => {
  const { sessionId, format } = req.params;
  req.url = `/api/export/${format}/${sessionId}`;
  next('route');
});

// Forward clear notes route
router.delete('/sessions/:sessionId/notes', (req, res, next) => {
  const { sessionId } = req.params;
  const session = req.app.locals.sessionService.getSession(sessionId);
  
  if (!session || !session.currentSequenceId) {
    return res.status(404).json({
      success: false,
      error: 'No current sequence',
      message: 'No current sequence found for the session'
    });
  }
  
  req.url = `/api/patterns/notes/${sessionId}/${session.currentSequenceId}`;
  next('route');
});

module.exports = router;
