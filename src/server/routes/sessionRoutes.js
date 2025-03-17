// src/server/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { Session, sessions } = require('../models/session');
const { v4: uuidv4 } = require('uuid');

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
 * Create a new sequence in a session
 * POST /api/sessions/:sessionId/sequences
 */
router.post('/:sessionId/sequences', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, tempo, timeSignature, key } = req.body;
    
    // Get session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Generate a unique ID for the sequence
    const sequenceId = uuidv4();
    
    // Create a new track to represent the sequence
    const newTrack = {
      id: sequenceId,
      name: name || 'Untitled Sequence',
      tempo: tempo || 120,
      timeSignature: timeSignature || [4, 4],
      key: key || 'C major',
      notes: []
    };
    
    // Add the track to the session
    if (!session.tracks) {
      session.tracks = [];
    }
    session.tracks.push(newTrack);
    
    // Save the session
    await session.save();
    
    console.log(`Sequence created: ${sequenceId}`);
    
    res.status(201).json({
      success: true,
      sequenceId: sequenceId,
      message: 'Sequence created successfully',
      sequence: {
        id: sequenceId,
        name: newTrack.name,
        tempo: newTrack.tempo,
        timeSignature: newTrack.timeSignature,
        key: newTrack.key
      }
    });
  } catch (error) {
    console.error(`Error creating sequence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
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
    const sessionsArray = await Session.find();
    res.json({
      success: true,
      sessions: sessionsArray
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
 * Get a sequence from a session
 * GET /api/sessions/:sessionId/sequences/:sequenceId
 */
router.get('/:sessionId/sequences/:sequenceId', async (req, res) => {
  try {
    const { sessionId, sequenceId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Try to get the sequence (track)
    const track = session.tracks.find(t => t.id === sequenceId);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Sequence not found',
        message: `No sequence with ID ${sequenceId} exists in session ${sessionId}`
      });
    }
    
    // Format as a sequence
    const sequence = {
      id: track.id,
      name: track.name,
      tempo: track.tempo,
      timeSignature: track.timeSignature,
      key: track.key,
      notes: track.notes || []
    };
    
    res.json({
      success: true,
      sequence
    });
  } catch (error) {
    console.error(`Error getting sequence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
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

/**
 * Clear notes from current sequence
 * DELETE /api/sessions/:sessionId/notes
 */
router.delete('/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // In our model, notes are stored in tracks. 
    // If there's only one track, clear its notes
    if (session.tracks && session.tracks.length > 0) {
      const track = session.tracks[0];
      const previousNotesCount = track.notes ? track.notes.length : 0;
      track.notes = [];
      
      await session.save();
      
      res.json({
        success: true,
        message: `Cleared ${previousNotesCount} notes from current sequence`,
        currentSequenceId: track.id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'No tracks found',
        message: 'No tracks found in the session'
      });
    }
  } catch (error) {
    console.error(`Error clearing notes: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
