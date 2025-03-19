// src/server/routes/patternRoutes.js
const express = require('express');
const router = express.Router();
const { generatePattern } = require('../../core/patternGenerator');
const { Session } = require('../models/session');
const { MidiNote } = require('../models/sequence');

// Debug logging helper
function logRequestDetails(location, req) {
  console.log(`\n=== DEBUG ${location} ===`);
  console.log(`Path: ${req.path}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Method: ${req.method}`);
  console.log(`SessionID sources:`);
  console.log(`- From params: ${req.params.sessionId}`);
  console.log(`- From body: ${req.body && req.body.sessionId}`);
  console.log(`- From query: ${req.query && req.query.sessionId}`);
  console.log(`Complete request details:`);
  console.log(`- Full params: ${JSON.stringify(req.params)}`);
  console.log(`- Full body: ${JSON.stringify(req.body)}`);
  console.log(`- Full query: ${JSON.stringify(req.query)}`);
  console.log(`- Headers: ${JSON.stringify(req.headers)}`);
}

// Handler function for chord progression - can be called directly
async function handleChordProgression(req, res) {
  try {
    // Debug log at start of function
    logRequestDetails('handleChordProgression', req);
    
    // Get sessionId from all possible places with verbose logging
    const sessionIdFromParams = req.params.sessionId;
    const sessionIdFromBody = req.body && req.body.sessionId;
    const sessionIdFromQuery = req.query && req.query.sessionId;
    
    // Use any available session ID source
    const sessionId = sessionIdFromParams || sessionIdFromBody || sessionIdFromQuery;
    
    console.log(`DEBUG: Final sessionId decision: ${sessionId}`);
    
    const { 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4],
      preview = false
    } = req.body;
    
    // Find session
    if (!sessionId) {
      console.error('DEBUG: No session ID found in request');
      // Creating a pattern without a session is not allowed
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    console.log(`DEBUG: Using session ID: ${sessionId}`);
    const session = await Session.findById(sessionId);
    
    if (!session) {
      console.error(`DEBUG: Session not found with ID ${sessionId}`);
      
      // List all available sessions for debugging
      const { sessions } = require('../models/session');
      const availableSessionIds = Array.from(sessions.keys());
      console.log(`DEBUG: Available sessions: ${availableSessionIds.join(', ')}`);
      
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
    
    console.log(`DEBUG: Generating pattern with options: ${JSON.stringify(options)}`);
    const rawNotes = generatePattern(options);
    console.log(`DEBUG: Generated ${rawNotes.length} raw notes`);
    
    // Convert raw notes to MidiNote objects
    const notes = rawNotes.map(note => 
      new MidiNote(note.pitch, note.startTime, note.duration, note.velocity || 80, note.channel || 0)
    );
    
    console.log(`DEBUG: Created ${notes.length} MidiNote objects`);
    
    // If preview flag is set, don't save to session
    if (preview) {
      console.log(`DEBUG: Preview mode - returning notes without saving to session`);
      return res.json({
        success: true,
        message: `Generated ${notes.length} notes for preview`,
        notes: notes,
        preview: true
      });
    }
    
    // IMPORTANT: Use the session's addNotes method to properly sync with tracks
    console.log(`DEBUG: Adding notes to session ${session.id}`);
    const addedNotes = session.addNotes(notes);
    
    // Force sync to ensure both tracks and sequences have notes
    console.log(`DEBUG: Syncing all tracks and sequences`);
    session.syncAllTracksAndSequences();
    
    console.log(`DEBUG: Saving session changes`);
    await session.save();
    
    // Double check note counts for debug purposes
    const currentSequence = session.getCurrentSequence();
    const sequenceNoteCount = currentSequence ? currentSequence.notes.length : 0;
    
    // Find the matching track
    const track = session.tracks.find(t => t.id === currentSequence.id);
    const trackNoteCount = track ? track.notes.length : 0;
    
    console.log(`DEBUG: After saving: Sequence has ${sequenceNoteCount} notes, Track has ${trackNoteCount} notes`);
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      sessionId: session.id,
      currentSequenceId: currentSequence.id,
      noteCount: sequenceNoteCount,
      trackNoteCount: trackNoteCount
    });
  } catch (error) {
    console.error(`DEBUG: Error in handleChordProgression: ${error.message}`);
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
    // Debug log at start of function
    logRequestDetails('handleBassline', req);
    
    // Get sessionId from all possible places with verbose logging
    const sessionIdFromParams = req.params.sessionId;
    const sessionIdFromBody = req.body && req.body.sessionId;
    const sessionIdFromQuery = req.query && req.query.sessionId;
    
    // Use any available session ID source
    const sessionId = sessionIdFromParams || sessionIdFromBody || sessionIdFromQuery;
    
    console.log(`DEBUG: Final sessionId decision: ${sessionId}`);
    
    const { 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5],
      preview = false
    } = req.body;
    
    // Find session
    if (!sessionId) {
      console.error('DEBUG: No session ID found in request');
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    console.log(`DEBUG: Using session ID: ${sessionId}`);
    const session = await Session.findById(sessionId);
    
    if (!session) {
      console.error(`DEBUG: Session not found with ID ${sessionId}`);
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
    
    console.log(`DEBUG: Generating pattern with options: ${JSON.stringify(options)}`);
    const rawNotes = generatePattern(options);
    console.log(`DEBUG: Generated ${rawNotes.length} raw notes`);
    
    // Convert raw notes to MidiNote objects
    const notes = rawNotes.map(note => 
      new MidiNote(note.pitch, note.startTime, note.duration, note.velocity || 80, note.channel || 1)
    );
    
    console.log(`DEBUG: Created ${notes.length} MidiNote objects`);
    
    // If preview flag is set, don't save to session
    if (preview) {
      console.log(`DEBUG: Preview mode - returning notes without saving to session`);
      return res.json({
        success: true,
        message: `Generated ${notes.length} notes for preview`,
        notes: notes,
        preview: true
      });
    }
    
    // IMPORTANT: Use the session's addNotes method to properly sync with tracks
    console.log(`DEBUG: Adding notes to session ${session.id}`);
    const addedNotes = session.addNotes(notes);
    
    // Force sync to ensure both tracks and sequences have notes
    console.log(`DEBUG: Syncing all tracks and sequences`);
    session.syncAllTracksAndSequences();
    
    console.log(`DEBUG: Saving session changes`);
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
    console.error(`DEBUG: Error in handleBassline: ${error.message}`);
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
    // Debug log at start of function
    logRequestDetails('handleDrums', req);
    
    // Get sessionId from all possible places with verbose logging
    const sessionIdFromParams = req.params.sessionId;
    const sessionIdFromBody = req.body && req.body.sessionId;
    const sessionIdFromQuery = req.query && req.query.sessionId;
    
    // Use any available session ID source
    const sessionId = sessionIdFromParams || sessionIdFromBody || sessionIdFromQuery;
    
    console.log(`DEBUG: Final sessionId decision: ${sessionId}`);
    
    const { 
      patternType = 'basic', 
      measures = 2,
      preview = false
    } = req.body;
    
    // Find session
    if (!sessionId) {
      console.error('DEBUG: No session ID found in request');
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    console.log(`DEBUG: Using session ID: ${sessionId}`);
    const session = await Session.findById(sessionId);
    
    if (!session) {
      console.error(`DEBUG: Session not found with ID ${sessionId}`);
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
    
    console.log(`DEBUG: Generating pattern with options: ${JSON.stringify(options)}`);
    const rawNotes = generatePattern(options);
    console.log(`DEBUG: Generated ${rawNotes.length} raw notes`);
    
    // Convert raw notes to MidiNote objects
    const notes = rawNotes.map(note => 
      new MidiNote(note.pitch, note.startTime, note.duration, note.velocity || 100, note.channel || 9)
    );
    
    console.log(`DEBUG: Created ${notes.length} MidiNote objects`);
    
    // If preview flag is set, don't save to session
    if (preview) {
      console.log(`DEBUG: Preview mode - returning notes without saving to session`);
      return res.json({
        success: true,
        message: `Generated ${notes.length} notes for preview`,
        notes: notes,
        preview: true
      });
    }
    
    // IMPORTANT: Use the session's addNotes method to properly sync with tracks
    console.log(`DEBUG: Adding notes to session ${session.id}`);
    const addedNotes = session.addNotes(notes);
    
    // Force sync to ensure both tracks and sequences have notes
    console.log(`DEBUG: Syncing all tracks and sequences`);
    session.syncAllTracksAndSequences();
    
    console.log(`DEBUG: Saving session changes`);
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
    console.error(`DEBUG: Error in handleDrums: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Debug middleware for all routes
router.use((req, res, next) => {
  console.log(`\n=== DEBUG PATTERN ROUTER: ${req.method} ${req.originalUrl} ===`);
  console.log(`Request body: ${JSON.stringify(req.body || {})}`);
  console.log(`Request params: ${JSON.stringify(req.params || {})}`);
  console.log(`Request query: ${JSON.stringify(req.query || {})}`);
  next();
});

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
    
    console.log(`DEBUG: Clear notes request for session ${sessionId}, track ${trackId}`);
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      console.error(`DEBUG: Session not found with ID ${sessionId}`);
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }
    
    // Find track
    if (!session.tracks) {
      console.error(`DEBUG: No tracks found in session ${sessionId}`);
      return res.status(404).json({ 
        success: false,
        error: 'No tracks found in session' 
      });
    }
    
    const trackIndex = session.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      console.error(`DEBUG: Track ${trackId} not found in session ${sessionId}`);
      return res.status(404).json({ 
        success: false,
        error: 'Track not found' 
      });
    }
    
    // Store note count before clearing
    const previousNoteCount = session.tracks[trackIndex].notes ? 
                             session.tracks[trackIndex].notes.length : 0;
    
    console.log(`DEBUG: Clearing ${previousNoteCount} notes from track ${trackId}`);
    
    // Clear notes
    session.tracks[trackIndex].notes = [];
    
    // Also clear the corresponding sequence if it exists
    if (session.sequences && session.sequences[trackId]) {
      console.log(`DEBUG: Also clearing notes from corresponding sequence ${trackId}`);
      session.sequences[trackId].notes = [];
    }
    
    console.log(`DEBUG: Saving session changes`);
    await session.save();
    
    res.json({
      success: true,
      message: `Cleared ${previousNoteCount} notes from track ${trackId}`,
      sessionId: session.id,
      trackId
    });
  } catch (error) {
    console.error(`DEBUG: Error clearing notes: ${error.message}`);
    console.error(error.stack);
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