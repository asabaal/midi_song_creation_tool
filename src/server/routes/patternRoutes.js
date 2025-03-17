// src/server/routes/patternRoutes.js
const express = require('express');
const router = express.Router();
const { generatePattern } = require('../../core/patternGenerator');
const { Session } = require('../models/session');

/**
 * Generate chord progression pattern
 * POST /api/patterns/chord-progression
 */
router.post('/chord-progression', async (req, res) => {
  try {
    const { 
      sessionId, 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4] 
    } = req.body;
    
    // Find session
    if (!sessionId) {
      // Creating a pattern without a session is not allowed
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required to create a pattern'
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
    
    // Generate chord progression pattern
    const options = {
      type: 'chord',
      root: key,
      octave: parseInt(octave),
      progression: progressionName.split('-'),
      chordType: scaleType,
      rhythmPattern: Array.isArray(rhythmPattern) ? rhythmPattern : [4]
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for chord progression in ${key}`);
    
    // Find or create the first track to store chord notes
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    if (session.tracks.length === 0) {
      // Create a new track
      track = {
        id: '1',
        name: 'Chord Progression',
        instrument: 0,
        notes: []
      };
      session.tracks.push(track);
    } else {
      // Use the first track
      track = session.tracks[0];
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    // CRITICAL: Also update the notes in the sequence object if it exists
    if (session.sequences) {
      if (track.id && session.sequences[track.id]) {
        // If the track has a corresponding sequence, update it
        console.log(`Updating sequence ${track.id} with ${notes.length} notes`);
        session.sequences[track.id].notes = track.notes;
      } else if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
        // Or update the current sequence
        console.log(`Updating current sequence ${session.currentSequenceId} with ${notes.length} notes`);
        session.sequences[session.currentSequenceId].notes = track.notes;
      } else {
        // Create a new sequence entry if one doesn't exist
        const sequenceId = track.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        track.id = sequenceId; // Ensure consistent IDs
        session.sequences[sequenceId] = {
          id: sequenceId,
          name: track.name || 'Chord Progression',
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes
        };
        session.currentSequenceId = sequenceId;
        console.log(`Created new sequence ${sequenceId} with ${notes.length} notes`);
      }
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Generate bassline pattern
 * POST /api/patterns/bassline
 */
router.post('/bassline', async (req, res) => {
  try {
    const { 
      sessionId, 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5] 
    } = req.body;
    
    // Find session
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required to create a pattern'
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
    
    // Generate bassline pattern
    const options = {
      type: 'bassline',
      key: key,
      octave: parseInt(octave),
      progression: progressionName.split('-'),
      style: 'walking',
      rhythmPattern: Array.isArray(rhythmPattern) ? rhythmPattern : [1, 0.5, 0.5]
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for bassline in ${key}`);
    
    // Find or create a bass track
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    // Look for an existing bass track
    track = session.tracks.find(t => t.instrument === 32);
    
    if (!track) {
      // Create a new track if none exists
      track = {
        id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
        name: 'Bassline',
        instrument: 32,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    // CRITICAL: Also update the notes in the sequence object if it exists
    if (session.sequences) {
      if (track.id && session.sequences[track.id]) {
        // If the track has a corresponding sequence, update it
        console.log(`Updating sequence ${track.id} with ${notes.length} notes`);
        session.sequences[track.id].notes = track.notes;
      } else if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
        // Or update the current sequence
        console.log(`Updating current sequence ${session.currentSequenceId} with ${notes.length} notes`);
        session.sequences[session.currentSequenceId].notes = track.notes;
      } else {
        // Create a new sequence entry
        const sequenceId = track.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        track.id = sequenceId; // Ensure consistent IDs
        session.sequences[sequenceId] = {
          id: sequenceId,
          name: track.name || 'Bassline',
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes
        };
        session.currentSequenceId = sequenceId;
        console.log(`Created new sequence ${sequenceId} with ${notes.length} notes`);
      }
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Generate drum pattern
 * POST /api/patterns/drums
 */
router.post('/drums', async (req, res) => {
  try {
    const { 
      sessionId, 
      patternType = 'basic', 
      measures = 2 
    } = req.body;
    
    // Find session
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required to create a pattern'
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
    
    // Generate drum pattern
    const options = {
      type: 'drum',
      style: patternType,
      bars: parseInt(measures) || 2
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for ${patternType} drum pattern`);
    
    // Find or create a drum track
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    // Look for an existing drum track
    track = session.tracks.find(t => t.instrument === 9);
    
    if (!track) {
      // Create a new track if none exists
      track = {
        id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
        name: 'Drums',
        instrument: 9,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    // CRITICAL: Also update the notes in the sequence object if it exists
    if (session.sequences) {
      if (track.id && session.sequences[track.id]) {
        // If the track has a corresponding sequence, update it
        console.log(`Updating sequence ${track.id} with ${notes.length} notes`);
        session.sequences[track.id].notes = track.notes;
      } else if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
        // Or update the current sequence
        console.log(`Updating current sequence ${session.currentSequenceId} with ${notes.length} notes`);
        session.sequences[session.currentSequenceId].notes = track.notes;
      } else {
        // Create a new sequence entry
        const sequenceId = track.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        track.id = sequenceId; // Ensure consistent IDs
        session.sequences[sequenceId] = {
          id: sequenceId,
          name: track.name || 'Drums',
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes
        };
        session.currentSequenceId = sequenceId;
        console.log(`Created new sequence ${sequenceId} with ${notes.length} notes`);
      }
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Clear notes from a track
 * DELETE /api/patterns/notes/:sessionId/:trackId
 */
router.delete('/notes/:sessionId/:trackId', async (req, res) => {
  try {
    const { sessionId, trackId } = req.params;
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }
    
    // Find track
    if (!session.tracks) {
      return res.status(404).json({ 
        success: false,
        error: 'No tracks found in session' 
      });
    }
    
    const trackIndex = session.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Track not found' 
      });
    }
    
    // Store note count before clearing
    const previousNoteCount = session.tracks[trackIndex].notes ? 
                             session.tracks[trackIndex].notes.length : 0;
    
    // Clear notes
    session.tracks[trackIndex].notes = [];
    
    // Also clear the corresponding sequence if it exists
    if (session.sequences && session.sequences[trackId]) {
      session.sequences[trackId].notes = [];
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Cleared ${previousNoteCount} notes from track ${trackId}`,
      sessionId: session._id,
      trackId
    });
  } catch (error) {
    console.error(`Error clearing notes: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
