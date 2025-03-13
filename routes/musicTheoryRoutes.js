const express = require('express');
const router = express.Router();

// Helper function to get scale notes for a given key and scale type
const getScaleNotes = (key, scaleType) => {
  // Basic implementation for testing
  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10]
  };

  // Map key to MIDI note number (C4 = 60)
  let rootNote = 60; // Default to C4
  
  // Handle octave specification
  let keyWithoutOctave = key;
  let octave = 4; // Default octave
  
  if (key.match(/[A-G][#b]?[0-9]/)) {
    octave = parseInt(key.slice(-1));
    keyWithoutOctave = key.slice(0, -1);
  }
  
  // Calculate root note based on key and octave
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  
  if (noteMap[keyWithoutOctave] !== undefined) {
    rootNote = 12 * (octave + 1) + noteMap[keyWithoutOctave];
  }
  
  // Get scale intervals
  const intervals = scales[scaleType] || scales.major;
  
  // Generate MIDI notes
  const midiNotes = intervals.map(interval => rootNote + interval);
  
  // Generate note names
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const notes = midiNotes.map(midi => {
    const noteName = noteNames[midi % 12];
    const noteOctave = Math.floor(midi / 12) - 1;
    return `${noteName}${noteOctave}`;
  });
  
  return { notes, midiNotes, key, scaleType };
};

// Get scale
router.get('/scales/:key/:scaleType', (req, res) => {
  const { key, scaleType } = req.params;
  try {
    const result = getScaleNotes(key, scaleType);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get chord
router.get('/chords/:key/:chordType', (req, res) => {
  const { key, chordType } = req.params;
  try {
    // Basic implementation for testing
    const chordMap = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      seventh: [0, 4, 7, 10],
      diminished: [0, 3, 6],
      augmented: [0, 4, 8]
    };
    
    // Get root note
    const { midiNotes } = getScaleNotes(key, 'major');
    const rootNote = midiNotes[0];
    
    // Generate chord notes
    const intervals = chordMap[chordType] || chordMap.major;
    const chordNotes = intervals.map(interval => rootNote + interval);
    
    res.json({ 
      notes: chordNotes, 
      key, 
      type: chordType 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Analyze chord
router.post('/analyze-chord', (req, res) => {
  const { notes } = req.body;
  try {
    // Simple chord analysis logic for testing
    // Assuming C is the root in this basic implementation
    res.json({
      root: 'C',
      type: 'major',
      inversion: notes[0] === 64 ? 1 : 0 // If first note is E (64), it's first inversion
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
