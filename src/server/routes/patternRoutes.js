// src/server/routes/patternRoutes.js
const express = require('express');
const router = express.Router();
const { generatePattern } = require('../../core/patternGenerator');
const sessionService = require('../services/sessionService');

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
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    // Check if session exists
    const session = sessionService.getSession(sessionId);
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
    
    try {
      // Try to add notes to existing sequence
      if (!session.currentSequenceId) {
        throw new Error('No current sequence');
      }
      
      const updatedSequence = sessionService.addNotes(sessionId, notes);
      
      res.json({
        success: true,
        message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
        sessionId: sessionId,
        sequenceId: session.currentSequenceId,
        noteCount: updatedSequence.notes.length
      });
    } catch (error) {
      // If there's no current sequence, create one first
      const sequence = sessionService.createSequence(sessionId, {
        name: `${key} ${progressionName} Progression`,
        key: `${key} ${scaleType}`
      });
      
      // Then add notes
      const updatedSequence = sessionService.addNotes(sessionId, notes);
      
      res.json({
        success: true,
        message: `Created new sequence and added ${notes.length} notes from ${key} ${progressionName} progression`,
        sessionId: sessionId,
        sequenceId: sequence.id,
        noteCount: updatedSequence.notes.length
      });
    }
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message
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
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    // Check if session exists
    const session = sessionService.getSession(sessionId);
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
    
    try {
      // Try to add notes to existing sequence
      if (!session.currentSequenceId) {
        throw new Error('No current sequence');
      }
      
      const updatedSequence = sessionService.addNotes(sessionId, notes);
      
      res.json({
        success: true,
        message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
        sessionId: sessionId,
        sequenceId: session.currentSequenceId,
        noteCount: updatedSequence.notes.length
      });
    } catch (error) {
      // If there's no current sequence, create one first
      const sequence = sessionService.createSequence(sessionId, {
        name: `${key} ${progressionName} Bassline`,
        key: `${key} ${scaleType}`
      });
      
      // Then add notes
      const updatedSequence = sessionService.addNotes(sessionId, notes);
      
      res.json({
        success: true,
        message: `Created new sequence and added ${notes.length} notes for ${key} ${progressionName} bassline`,
        sessionId: sessionId,
        sequenceId: sequence.id,
        noteCount: updatedSequence.notes.length
      });
    }
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message
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
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    // Check if session exists
    const session = sessionService.getSession(sessionId);
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
    
    try {
      // Try to add notes to existing sequence
      if (!session.currentSequenceId) {
        throw new Error('No current sequence');
      }
      
      const updatedSequence = sessionService.addNotes(sessionId, notes);
      
      res.json({
        success: true,
        message: `Added ${notes.length} notes for ${patternType} drum pattern`,
        sessionId: sessionId,
        sequenceId: session.currentSequenceId,
        noteCount: updatedSequence.notes.length
      });
    } catch (error) {
      // If there's no current sequence, create one first
      const sequence = sessionService.createSequence(sessionId, {
        name: `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`,
        key: 'C major'  // Key doesn't matter for drums
      });
      
      // Then add notes
      const updatedSequence = sessionService.addNotes(sessionId, notes);
      
      res.json({
        success: true,
        message: `Created new sequence and added ${notes.length} notes for ${patternType} drum pattern`,
        sessionId: sessionId,
        sequenceId: sequence.id,
        noteCount: updatedSequence.notes.length
      });
    }
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

/**
 * Clear notes from a sequence
 * DELETE /api/patterns/notes/:sessionId/:sequenceId
 */
router.delete('/notes/:sessionId/:sequenceId', async (req, res) => {
  try {
    const { sessionId, sequenceId } = req.params;
    
    // Check if session exists
    const session = sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Get the sequence
    const sequence = sessionService.getSequence(sessionId, sequenceId);
    if (!sequence) {
      return res.status(404).json({ 
        success: false,
        error: 'Sequence not found',
        message: `Sequence with ID ${sequenceId} not found in session ${sessionId}`
      });
    }
    
    // Store note count before clearing
    const previousNoteCount = sequence.notes.length;
    
    // Clear notes
    sequence.notes = [];
    
    res.json({
      success: true,
      message: `Cleared ${previousNoteCount} notes from sequence ${sequenceId}`,
      sessionId: sessionId,
      sequenceId: sequenceId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

module.exports = router;
