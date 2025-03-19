// src/server/routes/patternRoutes.js
const express = require('express');
const router = express.Router();
const { generatePattern } = require('../../core/patternGenerator');
const { Session } = require('../models/session');
const { MidiNote } = require('../models/sequence');

// Handler function for chord progression - can be called directly
async function handleChordProgression(req, res) {
  try {
    // Get sessionId from either params or body
    const sessionId = req.params.sessionId || req.body.sessionId;
    const { 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4] 
    } = req.body;
    
    console.log(`Handling chord progression for session ${sessionId} with key ${key}`);
    
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
    
    const rawNotes = generatePattern(options);
    
    // Convert raw notes to MidiNote objects
    const notes = rawNotes.map(note => 
      new MidiNote(note.pitch, note.startTime, note.duration, note.velocity || 80, note.channel || 0)
    );
    
    console.log(`Generated ${notes.length} notes for chord progression in ${key}`);
    
    // IMPORTANT: Use the session's addNotes method to properly sync with tracks
    const addedNotes = session.addNotes(notes);
    
    // Force sync to ensure both tracks and sequences have notes
    session.syncAllTracksAndSequences();
    await session.save();
    
    // Double check note counts for debug purposes
    const currentSequence = session.getCurrentSequence();
    const sequenceNoteCount = currentSequence ? currentSequence.notes.length : 0;
    
    // Find the matching track
    const track = session.tracks.find(t => t.id === currentSequence.id);
    const trackNoteCount = track ? track.notes.length : 0;
    
    console.log(`After saving: Sequence has ${sequenceNoteCount} notes, Track has ${trackNoteCount} notes`);
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      sessionId: session.id,
      currentSequenceId: currentSequence.id,
      noteCount: sequenceNoteCount,
      trackNoteCount: trackNoteCount
    });
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Handler function for bassline - can be called directly
async function handleBassline(req, res) {
  try {
    // Get sessionId from either params or body
    const sessionId = req.params.sessionId || req.body.sessionId;
    const { 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5] 
    } = req.body;
    
    console.log(`Handling bassline for session ${sessionId} with key ${key}`);
    
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
    
    const rawNotes = generatePattern(options);
    
    // Convert raw notes to MidiNote objects
    const notes = rawNotes.map(note => 
      new MidiNote(note.pitch, note.startTime, note.duration, note.velocity || 80, note.channel || 1)
    );
    
    console.log(`Generated ${notes.length} notes for bassline in ${key}`);
    
    // IMPORTANT: Use the session's addNotes method to properly sync with tracks
    const addedNotes = session.addNotes(notes);
    
    // Force sync to ensure both tracks and sequences have notes
    session.syncAllTracksAndSequences();
    await session.save();
    
    // Double check note counts for debug purposes
    const currentSequence = session.getCurrentSequence();
    const sequenceNoteCount = currentSequence ? currentSequence.notes.length : 0;
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      sessionId: session.id,
      currentSequenceId: currentSequence.id,
      noteCount: sequenceNoteCount
    });
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Handler function for drums - can be called directly
async function handleDrums(req, res) {
  try {
    // Get sessionId from either params or body
    const sessionId = req.params.sessionId || req.body.sessionId;
    const { 
      patternType = 'basic', 
      measures = 2 
    } = req.body;
    
    console.log(`Handling drums for session ${sessionId} with pattern ${patternType}`);
    
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
    
    const rawNotes = generatePattern(options);
    
    // Convert raw notes to MidiNote objects
    const notes = rawNotes.map(note => 
      new MidiNote(note.pitch, note.startTime, note.duration, note.velocity || 100, note.channel || 9)
    );
    
    console.log(`Generated ${notes.length} notes for ${patternType} drum pattern`);
    
    // IMPORTANT: Use the session's addNotes method to properly sync with tracks
    const addedNotes = session.addNotes(notes);
    
    // Force sync to ensure both tracks and sequences have notes
    session.syncAllTracksAndSequences();
    await session.save();
    
    // Double check note counts for debug purposes
    const currentSequence = session.getCurrentSequence();
    const sequenceNoteCount = currentSequence ? currentSequence.notes.length : 0;
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      sessionId: session.id,
      currentSequenceId: currentSequence.id,
      noteCount: sequenceNoteCount
    });
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Generate chord progression pattern
 * POST /api/patterns/chord-progression
 */
// Modified to accept sessionId as a parameter
router.post('/chord-progression/:sessionId?', handleChordProgression);

/**
 * Generate bassline pattern
 * POST /api/patterns/bassline
 */
// Modified to accept sessionId as a parameter
router.post('/bassline/:sessionId?', handleBassline);

/**
 * Generate drum pattern
 * POST /api/patterns/drums
 */
// Modified to accept sessionId as a parameter
router.post('/drums/:sessionId?', handleDrums);

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
      sessionId: session.id,
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

// Export the router and the handler functions
module.exports = router;
module.exports.handleChordProgression = handleChordProgression;
module.exports.handleBassline = handleBassline;
module.exports.handleDrums = handleDrums;
