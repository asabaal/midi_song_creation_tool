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
    
    const newSession = new Session();
    if (name) newSession.name = name;
    if (bpm) newSession.bpm = bpm;
    if (timeSignature) newSession.timeSignature = timeSignature;
    
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
    
    // Generate a unique ID for the sequence
    const sequenceId = `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a sequence object with an empty notes array
    const newSequence = {
      id: sequenceId,
      name: name || 'Untitled Sequence',
      tempo: tempo || 120,
      timeSignature: timeSignature || { numerator: 4, denominator: 4 },
      key: key || 'C major',
      notes: []
    };
    
    // Store in both places for compatibility
    // 1. In the tracks array (used by pattern routes)
    if (!session.tracks) {
      session.tracks = [];
    }
    
    // Add as a track
    session.tracks.push({
      id: sequenceId,
      name: newSequence.name,
      tempo: newSequence.tempo,
      timeSignature: newSequence.timeSignature,
      key: newSequence.key,
      instrument: 0,
      notes: []
    });
    
    // 2. In the sequences object (used by sequence routes)
    if (!session.sequences) {
      session.sequences = {};
    }
    session.sequences[sequenceId] = newSequence;
    session.currentSequenceId = sequenceId;
    
    // Save the session
    await session.save();
    
    console.log(`Sequence created: ${sequenceId}`);
    
    res.status(201).json({
      success: true,
      sequenceId: sequenceId,
      message: 'Sequence created successfully',
      sequence: {
        id: sequenceId,
        name: newSequence.name,
        tempo: newSequence.tempo,
        timeSignature: newSequence.timeSignature,
        key: newSequence.key
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
    
    // First, check if the sequence exists in the sequences object
    if (session.sequences && session.sequences[sequenceId]) {
      console.log(`Found sequence in sequences object with ${session.sequences[sequenceId].notes ? session.sequences[sequenceId].notes.length : 0} notes`);
      return res.json({
        success: true,
        sequence: session.sequences[sequenceId]
      });
    }
    
    // If not found there, look for it in the tracks
    if (session.tracks) {
      const track = session.tracks.find(t => t.id === sequenceId);
      if (track) {
        console.log(`Found sequence in tracks array with ${track.notes ? track.notes.length : 0} notes`);
        // Format as a sequence
        const sequence = {
          id: track.id,
          name: track.name,
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes || []
        };
        
        // Sync it back to the sequences object for future calls
        if (!session.sequences) {
          session.sequences = {};
        }
        session.sequences[sequenceId] = sequence;
        await session.save();
        
        return res.json({
          success: true,
          sequence
        });
      }
    }
    
    // Try returning current sequence as a fallback
    if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      console.log(`Falling back to current sequence ${session.currentSequenceId}`);
      return res.json({
        success: true,
        sequence: session.sequences[session.currentSequenceId]
      });
    }
    
    // Try first track as a last resort
    if (session.tracks && session.tracks.length > 0) {
      const firstTrack = session.tracks[0];
      console.log(`Falling back to first track ${firstTrack.id} with ${firstTrack.notes ? firstTrack.notes.length : 0} notes`);
      
      const sequence = {
        id: firstTrack.id,
        name: firstTrack.name || 'Default Sequence',
        tempo: firstTrack.tempo || 120,
        timeSignature: firstTrack.timeSignature || { numerator: 4, denominator: 4 },
        key: firstTrack.key || 'C major',
        notes: firstTrack.notes || []
      };
      
      // Sync it back
      if (!session.sequences) {
        session.sequences = {};
      }
      session.sequences[firstTrack.id] = sequence;
      session.currentSequenceId = firstTrack.id;
      await session.save();
      
      return res.json({
        success: true,
        sequence
      });
    }
    
    // No sequence found
    return res.status(404).json({
      success: false,
      error: 'Sequence not found',
      message: `No sequence with ID ${sequenceId} exists in session ${sessionId}`
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
    
    // First, try to clear notes from the current sequence if it exists
    if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      const sequence = session.sequences[session.currentSequenceId];
      const previousNotesCount = sequence.notes ? sequence.notes.length : 0;
      sequence.notes = [];
      
      // Also clear the corresponding track
      if (session.tracks) {
        const track = session.tracks.find(t => t.id === session.currentSequenceId);
        if (track) {
          track.notes = [];
        }
      }
      
      await session.save();
      
      return res.json({
        success: true,
        message: `Cleared ${previousNotesCount} notes from current sequence`,
        currentSequenceId: session.currentSequenceId
      });
    }
    
    // Fall back to clearing notes from the first track
    if (session.tracks && session.tracks.length > 0) {
      const track = session.tracks[0];
      const previousNotesCount = track.notes ? track.notes.length : 0;
      track.notes = [];
      
      // Also clear the corresponding sequence
      if (session.sequences && session.sequences[track.id]) {
        session.sequences[track.id].notes = [];
      }
      
      await session.save();
      
      return res.json({
        success: true,
        message: `Cleared ${previousNotesCount} notes from current sequence`,
        currentSequenceId: track.id
      });
    }
    
    // No tracks or sequences found
    return res.status(400).json({
      success: false,
      error: 'No tracks or sequences found',
      message: 'No tracks or sequences found in the session'
    });
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
