// src/server/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { Session } = require('../models/session');

/**
 * Create a new session
 * POST /api/sessions
 */
router.post('/', async (req, res) => {
  try {
    const { name, bpm, timeSignature } = req.body;
    
    const newSession = new Session({
      name: name || 'Untitled Session',
      bpm: bpm || 120,
      timeSignature: timeSignature || [4, 4],
      tracks: []
    });
    
    await newSession.save();
    
    res.status(201).json({
      success: true,
      sessionId: newSession._id,
      message: 'Session created successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Get all sessions
 * GET /api/sessions
 */
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Get a session by ID
 * GET /api/sessions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Update a session
 * PUT /api/sessions/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }
    
    // Update session properties
    const { name, bpm, timeSignature, tracks, loop } = req.body;
    
    if (name) session.name = name;
    if (bpm) session.bpm = bpm;
    if (timeSignature) session.timeSignature = timeSignature;
    if (tracks) session.tracks = tracks;
    if (loop) session.loop = loop;
    
    await session.save();
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Delete a session
 * DELETE /api/sessions/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Session deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
