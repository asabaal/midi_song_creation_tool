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
    
    // Find or create session
    let session;
    if (sessionId) {
      session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      session = new Session({
        name: `${key} ${progressionName} Progression`,
        bpm: 120,
        timeSignature: [4, 4],
      });
      await session.save();
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
    
    // Add notes to session
    const track = session.tracks.find(t => t.instrument === 0) || { 
      id: session.tracks.length + 1,
      name: 'Chord Progression',
      instrument: 0,
      notes: []
    };
    
    // If track doesn't exist yet, add it
    if (!session.tracks.find(t => t.id === track.id)) {
      session.tracks.push(track);
    }
    
    // Add notes to track
    track.notes = track.notes.concat(notes);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      sessionId: session._id,
      noteCount: track.notes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    
    // Find or create session
    let session;
    if (sessionId) {
      session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      session = new Session({
        name: `${key} ${progressionName} Bassline`,
        bpm: 120,
        timeSignature: [4, 4],
      });
      await session.save();
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
    
    // Add notes to session
    const track = session.tracks.find(t => t.instrument === 32) || { 
      id: session.tracks.length + 1,
      name: 'Bassline',
      instrument: 32, // Acoustic bass
      notes: []
    };
    
    // If track doesn't exist yet, add it
    if (!session.tracks.find(t => t.id === track.id)) {
      session.tracks.push(track);
    }
    
    // Add notes to track
    track.notes = track.notes.concat(notes);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      sessionId: session._id,
      noteCount: track.notes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    
    // Find or create session
    let session;
    if (sessionId) {
      session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      session = new Session({
        name: `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`,
        bpm: 120,
        timeSignature: [4, 4],
      });
      await session.save();
    }
    
    // Generate drum pattern
    const options = {
      type: 'drum',
      style: patternType,
      bars: parseInt(measures) || 2
    };
    
    const notes = generatePattern(options);
    
    // Add notes to session
    const track = session.tracks.find(t => t.instrument === 9) || { 
      id: session.tracks.length + 1,
      name: 'Drums',
      instrument: 9, // MIDI channel 10 (9 in zero-indexed)
      notes: []
    };
    
    // If track doesn't exist yet, add it
    if (!session.tracks.find(t => t.id === track.id)) {
      session.tracks.push(track);
    }
    
    // Add notes to track
    track.notes = track.notes.concat(notes);
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      sessionId: session._id,
      noteCount: track.notes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Find track
    const trackIndex = session.tracks.findIndex(t => t.id.toString() === trackId);
    if (trackIndex === -1) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Store note count before clearing
    const previousNoteCount = session.tracks[trackIndex].notes.length;
    
    // Clear notes
    session.tracks[trackIndex].notes = [];
    
    await session.save();
    
    res.json({
      success: true,
      message: `Cleared ${previousNoteCount} notes from track ${trackId}`,
      sessionId: session._id,
      trackId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
