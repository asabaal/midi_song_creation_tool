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
      name: name || 'New Session',
      bpm: bpm || 120,
      timeSignature: timeSignature || [4, 4]
    });
    
    await newSession.save();
    
    res.status(201).json({
      success: true,
      sessionId: newSession.id,
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
router.post('/:sessionId/sequences', createSequence);

// Handle function for sequence creation
async function createSequence(req, res) {
  try {
    const { sessionId } = req.params;
    const { name, tempo, timeSignature, key } = req.body;
    
    console.log(`Creating sequence in session ${sessionId} with params:`, { name, tempo, timeSignature, key });
    
    // Check if session exists
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Use the Session model's createSequence method
    const sequence = session.createSequence({
      name: name || 'Untitled Sequence',
      tempo: tempo || 120,
      timeSignature: timeSignature || { numerator: 4, denominator: 4 },
      key: key || 'C major'
    });
    
    // Save the session
    await session.save();
    
    console.log(`Sequence created: ${sequence.id}`);
    
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
    console.error(`Error creating sequence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

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
    
    // Ensure tracks are synchronized with sequences
    if (session.sequences && session.currentSequenceId && session.sequences[session.currentSequenceId]) {
      const currentSequence = session.sequences[session.currentSequenceId];
      if (typeof session._syncTrackWithSequence === 'function') {
        session._syncTrackWithSequence(currentSequence);
      }
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.createdAt,
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences(),
        tracks: session.tracks || []
      }
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
    
    console.log(`Getting sequence ${sequenceId} from session ${sessionId}`);
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    try {
      // Use the Session model's getSequence method
      const sequence = session.getSequence(sequenceId);
      
      res.json({
        success: true,
        sequence: sequence.toJSON ? sequence.toJSON() : sequence
      });
    } catch (error) {
      // If specific sequence not found, try current sequence
      if (session.currentSequenceId) {
        try {
          const currentSequence = session.getCurrentSequence();
          if (currentSequence) {
            return res.json({
              success: true,
              sequence: currentSequence.toJSON ? currentSequence.toJSON() : currentSequence
            });
          }
        } catch (innerError) {
          console.log(`Could not get current sequence: ${innerError.message}`);
        }
      }
      
      res.status(404).json({
        success: false,
        error: 'Sequence not found',
        message: `No sequence with ID ${sequenceId} exists in session ${sessionId}`
      });
    }
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
    const { name, bpm, timeSignature, loop } = req.body;
    
    if (name) session.name = name;
    if (bpm) session.bpm = bpm;
    if (timeSignature) session.timeSignature = timeSignature;
    if (loop) session.loop = loop;
    
    await session.save();
    
    res.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        bpm: session.bpm,
        timeSignature: session.timeSignature,
        loop: session.loop,
        tracks: session.tracks || [],
        currentSequenceId: session.currentSequenceId
      }
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
    
    try {
      // Use the clearNotes method from the enhanced Session model
      const previousNotes = session.clearNotes();
      
      await session.save();
      
      return res.json({
        success: true,
        message: `Cleared ${previousNotes.length} notes from current sequence`,
        currentSequenceId: session.currentSequenceId
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to clear notes',
        message: error.message
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

// Export the router and the createSequence handler for use in app.js
module.exports = router;
module.exports.handle = createSequence;
