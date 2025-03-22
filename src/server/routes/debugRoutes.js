// src/server/routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const { Session, sessions } = require('../models/session');

// Get detailed information about all sessions
router.get('/sessions', async (req, res) => {
  try {
    const allSessions = await Session.find();
    
    const sessionDetails = allSessions.map(session => {
      // Get tracks summary
      const trackSummary = (session.tracks || []).map(track => ({
        id: track.id,
        name: track.name,
        instrument: track.instrument,
        noteCount: (track.notes || []).length,
        sampleNotes: (track.notes || []).slice(0, 3).map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration
        }))
      }));
      
      // Get sequences summary
      const sequenceKeys = Object.keys(session.sequences || {});
      const sequencesSummary = sequenceKeys.map(key => {
        const seq = session.sequences[key];
        return {
          id: seq.id,
          name: seq.name,
          key: seq.key,
          tempo: seq.tempo,
          noteCount: (seq.notes || []).length,
          sampleNotes: (seq.notes || []).slice(0, 3).map(note => ({
            pitch: note.pitch,
            startTime: note.startTime,
            duration: note.duration
          }))
        };
      });
      
      return {
        id: session.id,
        name: session.name,
        bpm: session.bpm,
        timeSignature: session.timeSignature,
        currentSequenceId: session.currentSequenceId,
        trackCount: (session.tracks || []).length,
        sequenceCount: sequenceKeys.length,
        tracks: trackSummary,
        sequences: sequencesSummary
      };
    });
    
    res.json({
      success: true,
      sessionCount: sessionDetails.length,
      sessions: sessionDetails
    });
  } catch (error) {
    console.error(`Error in debug sessions route: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions information',
      message: error.message
    });
  }
});

// Get detailed information about a specific session
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Ensure all tracks and sequences are synced
    session.syncAllTracksAndSequences();
    await session.save();
    
    const trackDetails = (session.tracks || []).map(track => ({
      id: track.id,
      name: track.name,
      instrument: track.instrument,
      noteCount: (track.notes || []).length,
      notes: (track.notes || []).map(note => ({
        pitch: note.pitch,
        startTime: note.startTime,
        duration: note.duration,
        velocity: note.velocity,
        channel: note.channel
      }))
    }));
    
    const sequenceDetails = Object.keys(session.sequences || {}).map(key => {
      const seq = session.sequences[key];
      return {
        id: seq.id,
        name: seq.name,
        key: seq.key,
        tempo: seq.tempo,
        timeSignature: seq.timeSignature,
        noteCount: (seq.notes || []).length,
        notes: (seq.notes || []).map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          velocity: note.velocity,
          channel: note.channel
        }))
      };
    });
    
    res.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        bpm: session.bpm,
        timeSignature: session.timeSignature,
        createdAt: session.createdAt,
        currentSequenceId: session.currentSequenceId,
        trackCount: (session.tracks || []).length,
        sequenceCount: Object.keys(session.sequences || {}).length,
        tracks: trackDetails,
        sequences: sequenceDetails
      }
    });
  } catch (error) {
    console.error(`Error in debug session detail route: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get session information',
      message: error.message
    });
  }
});

// Force sync tracks and sequences for a session
router.post('/sessions/:sessionId/sync', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Force sync all tracks and sequences
    session.syncAllTracksAndSequences();
    await session.save();
    
    res.json({
      success: true,
      message: `Successfully synced all tracks and sequences for session ${sessionId}`,
      trackCount: (session.tracks || []).length,
      sequenceCount: Object.keys(session.sequences || {}).length
    });
  } catch (error) {
    console.error(`Error in sync route: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to sync tracks and sequences',
      message: error.message
    });
  }
});

// Check notes for a specific track in a session
router.get('/sessions/:sessionId/tracks/:trackId/notes', async (req, res) => {
  try {
    const { sessionId, trackId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Find the track
    const track = (session.tracks || []).find(t => t.id === trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found',
        message: `No track with ID ${trackId} exists in session ${sessionId}`
      });
    }
    
    // Find the corresponding sequence
    const sequence = session.sequences[trackId];
    
    res.json({
      success: true,
      track: {
        id: track.id,
        name: track.name,
        instrument: track.instrument,
        noteCount: (track.notes || []).length,
        notes: (track.notes || []).map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          velocity: note.velocity,
          channel: note.channel
        }))
      },
      sequence: sequence ? {
        id: sequence.id,
        name: sequence.name,
        noteCount: (sequence.notes || []).length,
        notes: (sequence.notes || []).map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          velocity: note.velocity,
          channel: note.channel
        }))
      } : null
    });
  } catch (error) {
    console.error(`Error in track notes route: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get track notes',
      message: error.message
    });
  }
});

module.exports = router;
