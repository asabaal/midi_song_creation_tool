// src/server/routes/musicTheoryRoutes.js
const express = require('express');
const router = express.Router();
const musicTheory = require('../../core/musicTheory');

/**
 * Get a scale
 * GET /api/music-theory/scales/:root/:type
 */
router.get('/scales/:root/:type', (req, res) => {
  try {
    const { root, type } = req.params;
    const octave = parseInt(req.query.octave || 4);
    
    // Generate the scale in MIDI notes
    const midiNotes = musicTheory.generateScale(root, type, octave);
    
    // Convert MIDI notes to note names
    const notes = midiNotes.map(midiNote => {
      const noteName = musicTheory.midiToNote(midiNote);
      return noteName.replace(/\d+$/, ''); // Remove octave number
    });
    
    res.json({
      root,
      type,
      octave,
      notes,
      midiNotes
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get a chord
 * GET /api/music-theory/chords/:root/:type
 */
router.get('/chords/:root/:type', (req, res) => {
  try {
    const { root, type } = req.params;
    const octave = parseInt(req.query.octave || 4);
    
    // Generate the chord in MIDI notes
    const midiNotes = musicTheory.generateChord(root, type, octave);
    
    // Convert MIDI notes to note names
    const notes = midiNotes.map(midiNote => {
      const noteName = musicTheory.midiToNote(midiNote);
      return noteName.replace(/\d+$/, ''); // Remove octave number
    });
    
    res.json({
      root,
      type,
      octave,
      notes,
      midiNotes
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get a chord progression
 * GET /api/music-theory/progressions/:key/:mode
 */
router.get('/progressions/:key/:mode', (req, res) => {
  try {
    const { key, mode } = req.params;
    const numerals = req.query.numerals || 'I-IV-V-I';
    const octave = parseInt(req.query.octave || 4);
    
    // Split numerals string into array
    const numeralArray = numerals.split('-');
    
    // Generate the progression
    const chordArrays = musicTheory.generateChordProgression(numeralArray, key, mode, octave);
    
    // Format the response
    const chords = chordArrays.map((chordMidiNotes, index) => {
      const notes = chordMidiNotes.map(midiNote => {
        const noteName = musicTheory.midiToNote(midiNote);
        return noteName.replace(/\d+$/, ''); // Remove octave number
      });
      
      return {
        numeral: numeralArray[index],
        notes,
        midiNotes: chordMidiNotes
      };
    });
    
    res.json({
      key,
      mode,
      numerals,
      octave,
      chords
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get key signature
 * GET /api/music-theory/key-signature/:key/:mode
 */
router.get('/key-signature/:key/:mode', (req, res) => {
  try {
    const { key, mode } = req.params;
    
    // Get key signature info
    const keySignatureInfo = musicTheory.getKeySignature(`${key} ${mode}`);
    
    res.json(keySignatureInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Analyze a chord
 * POST /api/music-theory/analyze-chord
 */
router.post('/analyze-chord', (req, res) => {
  try {
    const { midiNotes } = req.body;
    
    if (!Array.isArray(midiNotes) || midiNotes.length < 3) {
      return res.status(400).json({ error: 'At least 3 notes required to analyze a chord' });
    }
    
    // Sort notes in ascending order
    const sortedNotes = [...midiNotes].sort((a, b) => a - b);
    
    // Get note names
    const noteNames = sortedNotes.map(midiNote => {
      const noteName = musicTheory.midiToNote(midiNote);
      return noteName.replace(/\d+$/, ''); // Remove octave number
    });
    
    // Analyze chord (simplified implementation)
    // In a real implementation, this would use more advanced chord recognition algorithms
    let root = noteNames[0];
    let type = 'unknown';
    let inversion = 0;
    
    // Try to identify common chord types based on intervals
    const intervals = [];
    for (let i = 1; i < sortedNotes.length; i++) {
      intervals.push(sortedNotes[i] - sortedNotes[0]);
    }
    
    // Major triad [0, 4, 7]
    if (intervals.length === 2 && intervals[0] === 4 && intervals[1] === 7) {
      type = 'major';
    }
    // Minor triad [0, 3, 7]
    else if (intervals.length === 2 && intervals[0] === 3 && intervals[1] === 7) {
      type = 'minor';
    }
    // Diminished triad [0, 3, 6]
    else if (intervals.length === 2 && intervals[0] === 3 && intervals[1] === 6) {
      type = 'diminished';
    }
    // Augmented triad [0, 4, 8]
    else if (intervals.length === 2 && intervals[0] === 4 && intervals[1] === 8) {
      type = 'augmented';
    }
    // Major 7th [0, 4, 7, 11]
    else if (intervals.length === 3 && intervals[0] === 4 && intervals[1] === 7 && intervals[2] === 11) {
      type = 'major7';
    }
    // Dominant 7th [0, 4, 7, 10]
    else if (intervals.length === 3 && intervals[0] === 4 && intervals[1] === 7 && intervals[2] === 10) {
      type = 'dominant7';
    }
    // Minor 7th [0, 3, 7, 10]
    else if (intervals.length === 3 && intervals[0] === 3 && intervals[1] === 7 && intervals[2] === 10) {
      type = 'minor7';
    }
    
    // If chord is recognized, check for inversions
    // This is a simplified approach; a real implementation would be more sophisticated
    if (type !== 'unknown') {
      // Check for 1st inversion (3rd in bass)
      if (type === 'major' && noteNames[0] === noteNames[1].replace(/[0-9]/g, '')) {
        root = noteNames[2];
        inversion = 1;
      }
      // Check for 2nd inversion (5th in bass)
      else if (type === 'major' && noteNames[0] === noteNames[2].replace(/[0-9]/g, '')) {
        root = noteNames[1];
        inversion = 2;
      }
    }
    
    res.json({
      root,
      type,
      inversion,
      notes: noteNames,
      midiNotes: sortedNotes
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
