// src/server/routes/musicTheoryRoutes.js
const express = require('express');
const router = express.Router();
const { ChordGenerator } = require('../../core/patternGenerator');

// Music theory constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_TYPES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10]
};

const CHORD_TYPES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  '7th': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10]
};

const PROGRESSION_MAP = {
  '1-4-5': ['I', 'IV', 'V'],
  '1-5-6-4': ['I', 'V', 'vi', 'IV'],
  '1-6-4-5': ['I', 'vi', 'IV', 'V'],
  '2-5-1': ['ii', 'V', 'I'],
  'blues': ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V']
};

/**
 * Generate a scale based on root note and scale type
 * GET /api/music-theory/scales/:root/:type
 */
router.get('/scales/:root/:type', (req, res) => {
  try {
    const { root, type } = req.params;
    const octave = parseInt(req.query.octave) || 4;
    
    // Validate inputs
    if (!NOTE_NAMES.includes(root)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid root note',
        message: `Root note must be one of: ${NOTE_NAMES.join(', ')}`
      });
    }
    
    if (!SCALE_TYPES[type]) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid scale type',
        message: `Scale type must be one of: ${Object.keys(SCALE_TYPES).join(', ')}`
      });
    }
    
    // Generate scale
    const rootIndex = NOTE_NAMES.indexOf(root);
    const scale = SCALE_TYPES[type].map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const noteName = NOTE_NAMES[noteIndex];
      return {
        noteName,
        midiNumber: (octave * 12) + rootIndex + interval
      };
    });
    
    res.json({
      success: true,
      scale,
      root,
      type,
      octave
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Generate a chord based on root note and chord type
 * GET /api/music-theory/chords/:root/:type
 */
router.get('/chords/:root/:type', (req, res) => {
  try {
    const { root, type } = req.params;
    const octave = parseInt(req.query.octave) || 4;
    
    // Validate inputs
    if (!NOTE_NAMES.includes(root)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid root note',
        message: `Root note must be one of: ${NOTE_NAMES.join(', ')}`
      });
    }
    
    if (!CHORD_TYPES[type]) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid chord type',
        message: `Chord type must be one of: ${Object.keys(CHORD_TYPES).join(', ')}`
      });
    }
    
    // Generate chord
    const rootIndex = NOTE_NAMES.indexOf(root);
    const chord = CHORD_TYPES[type].map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const noteName = NOTE_NAMES[noteIndex];
      return {
        noteName,
        midiNumber: (octave * 12) + rootIndex + interval
      };
    });
    
    res.json({
      success: true,
      chord,
      root,
      type,
      octave
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Generate a chord progression based on key and progression type
 * GET /api/music-theory/progressions/:key/:progression
 */
router.get('/progressions/:key/:progression', (req, res) => {
  try {
    const { key, progression } = req.params;
    const scaleType = req.query.scaleType || 'major';
    const octave = parseInt(req.query.octave) || 4;
    
    // Validate inputs
    if (!NOTE_NAMES.includes(key)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid key',
        message: `Key must be one of: ${NOTE_NAMES.join(', ')}`
      });
    }
    
    let progressionNumerals;
    if (PROGRESSION_MAP[progression]) {
      progressionNumerals = PROGRESSION_MAP[progression];
    } else {
      // Handle custom progressions like "1-4-5-1"
      progressionNumerals = progression.split('-').map(numeral => {
        switch (numeral) {
          case '1': return 'I';
          case '2': return 'ii';
          case '3': return 'iii';
          case '4': return 'IV';
          case '5': return 'V';
          case '6': return 'vi';
          case '7': return 'viio';
          default: return 'I';
        }
      });
    }
    
    // Generate the progression using ChordGenerator
    const chordGen = new ChordGenerator();
    const chords = chordGen.generateProgression(progressionNumerals, key, scaleType, octave);
    
    // Format the response
    const formattedChords = chords.map((chord, index) => {
      // Extract the root note for each chord
      const rootName = progressionNumerals[index];
      
      // Get the pitches from the chord
      const pitches = chord.map(note => note.pitch);
      
      return {
        position: index + 1,
        numeral: progressionNumerals[index],
        notes: pitches
      };
    });
    
    res.json({
      success: true,
      progression: formattedChords,
      key,
      scaleType,
      progressionName: progression
    });
  } catch (error) {
    console.error('Error generating progression:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;