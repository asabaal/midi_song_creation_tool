// src/server/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionService = require('../services/sessionService');

/**
 * Create a new session
 * POST /api/sessions
 */
router.post('/', async (req, res) => {
  try {
    const { name, bpm, timeSignature } = req.body;
    
    const session = sessionService.createSession({
      name: name || 'Untitled Session',
      bpm: bpm || 120,
      timeSignature: timeSignature || [4, 4]
    });
    
    res.status(201).json({
      success: true,
      sessionId: session.id,
      created: session.created,
      message: 'Session created successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

/**
 * Get all sessions
 * GET /api/sessions
 */
router.get('/', async (req, res) => {
  try {
    const sessions = sessionService.getAllSessions();
    res.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        name: session.name,
        created: session.created
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message 
    });
  }
});

/**
 * Get a session by ID
 * GET /api/sessions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    const session = sessionService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.created,
        name: session.name,
        bpm: session.bpm,
        timeSignature: session.timeSignature,
        currentSequenceId: session.currentSequenceId,
        tracks: session.tracks,
        sequences: Object.values(session.sequences).map(seq => ({
          id: seq.id,
          name: seq.name,
          noteCount: seq.notes.length
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message 
    });
  }
});

/**
 * Update a session
 * PUT /api/sessions/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { name, bpm, timeSignature, tracks } = req.body;
    
    const session = sessionService.updateSession(sessionId, {
      name,
      bpm,
      timeSignature,
      tracks
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        bpm: session.bpm,
        timeSignature: session.timeSignature,
        tracks: session.tracks
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

/**
 * Delete a session
 * DELETE /api/sessions/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const deleted = sessionService.deleteSession(sessionId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

/**
 * Create a new sequence in a session
 * POST /api/sessions/:sessionId/sequences
 */
router.post('/:sessionId/sequences', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, tempo, timeSignature, key } = req.body;
    
    const sequence = sessionService.createSequence(sessionId, {
      name: name || 'Untitled Sequence',
      tempo: tempo || 120,
      timeSignature: timeSignature || [4, 4],
      key: key || 'C major'
    });
    
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
    res.status(error.message.includes('not found') ? 404 : 400).json({
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

/**
 * Get a sequence
 * GET /api/sessions/:sessionId/sequences/:sequenceId
 */
router.get('/:sessionId/sequences/:sequenceId', async (req, res) => {
  try {
    const { sessionId, sequenceId } = req.params;
    
    const sequence = sessionService.getSequence(sessionId, sequenceId);
    
    if (!sequence) {
      return res.status(404).json({
        success: false,
        error: 'Sequence not found',
        message: `Sequence with ID ${sequenceId} not found in session ${sessionId}`
      });
    }
    
    res.json({
      success: true,
      sequence: sequence
    });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

module.exports = router;
