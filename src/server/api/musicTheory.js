// Music theory API implementation
const express = require('express');
const router = express.Router();

// Helper functions for musical calculations
const getMidiNote = (noteName, octave = 4) => {
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  
  // Extract the note and octave if provided in format like "C4"
  let note = noteName;
  let oct = octave;
  
  if (noteName.match(/[A-G][b#]?\d/)) {
    const match = noteName.match(/([A-G][b#]?)(\d)/);
    note = match[1];
    oct = parseInt(match[2], 10);
  }
  
  if (!noteMap.hasOwnProperty(note)) {
    throw new Error(`Invalid note name: ${note}`);
  }
  
  return 12 + (oct * 12) + noteMap[note];
};

// Scale patterns (semitone intervals from the root)
const scalePatterns = {
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

// Chord patterns (semitone intervals from the root)
const chordPatterns = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  seventh: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7]
};

// Helper to get note name from midi number
const getNoteNameFromMidi = (midiNumber) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteName = noteNames[midiNumber % 12];
  return `${noteName}${octave}`;
};

// Generate scale notes based on root and pattern
const generateScale = (root, scaleType) => {
  try {
    // Handle root note formatting
    let rootNote = root;
    let octave = 4;
    
    // Extract octave if specified (e.g., "C4")
    if (root.match(/[A-G][b#]?\d/)) {
      const match = root.match(/([A-G][b#]?)(\d)/);
      rootNote = match[1];
      octave = parseInt(match[2], 10);
    }
    
    // Get the pattern for this scale type
    const pattern = scalePatterns[scaleType.toLowerCase()];
    if (!pattern) {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }
    
    // Calculate root MIDI note
    const rootMidi = getMidiNote(rootNote, octave);
    
    // Generate MIDI notes for the scale
    const midiNotes = pattern.map(interval => rootMidi + interval);
    
    // Generate note names
    const notes = midiNotes.map(getNoteNameFromMidi);
    
    return {
      root: rootNote,
      type: scaleType,
      notes: notes,
      midiNotes: midiNotes
    };
  } catch (error) {
    console.error('Error generating scale:', error);
    throw error;
  }
};

// Generate chord notes based on root and pattern
const generateChord = (root, chordType) => {
  try {
    // Handle root note formatting
    let rootNote = root;
    let octave = 4;
    
    // Extract octave if specified (e.g., "C4")
    if (root.match(/[A-G][b#]?\d/)) {
      const match = root.match(/([A-G][b#]?)(\d)/);
      rootNote = match[1];
      octave = parseInt(match[2], 10);
    }
    
    // Get the pattern for this chord type
    const pattern = chordPatterns[chordType.toLowerCase()];
    if (!pattern) {
      throw new Error(`Unknown chord type: ${chordType}`);
    }
    
    // Calculate root MIDI note
    const rootMidi = getMidiNote(rootNote, octave);
    
    // Generate MIDI notes for the chord
    const midiNotes = pattern.map(interval => rootMidi + interval);
    
    // Generate note names
    const notes = midiNotes.map(getNoteNameFromMidi);
    
    return {
      root: rootNote,
      type: chordType,
      notes: notes,
      midiNotes: midiNotes
    };
  } catch (error) {
    console.error('Error generating chord:', error);
    throw error;
  }
};

// Route to get scale notes
router.get('/scales/:root/:type', (req, res) => {
  try {
    const { root, type } = req.params;
    const scale = generateScale(root, type);
    res.json(scale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get chord notes
router.get('/chords/:root/:type', (req, res) => {
  try {
    const { root, type } = req.params;
    const chord = generateChord(root, type);
    res.json(chord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to analyze a chord from given notes
router.post('/analyze-chord', (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes || !Array.isArray(notes) || notes.length < 2) {
      return res.status(400).json({ error: 'Invalid notes array' });
    }
    
    // Sort notes in ascending order
    const sortedNotes = [...notes].sort((a, b) => a - b);
    
    // Calculate intervals from the lowest note
    const intervals = sortedNotes.map(note => note - sortedNotes[0]);
    
    // Attempt to identify the chord
    let found = false;
    let root = null;
    let type = 'unknown';
    let inversion = 0;
    
    // Check all possible roots and inversions
    for (let i = 0; i < sortedNotes.length; i++) {
      const testRoot = sortedNotes[i];
      const testIntervals = sortedNotes.map(note => {
        let interval = (note - testRoot) % 12;
        if (interval < 0) interval += 12;
        return interval;
      }).sort((a, b) => a - b);
      
      // Check each chord pattern
      for (const [chordName, pattern] of Object.entries(chordPatterns)) {
        // Compare pattern with intervals, allowing for octave differences
        const patternSet = new Set(pattern);
        const testIntervalsSet = new Set(testIntervals);
        
        if (patternSet.size === testIntervalsSet.size && 
            [...patternSet].every(interval => testIntervalsSet.has(interval))) {
          found = true;
          root = getNoteNameFromMidi(testRoot).charAt(0);
          type = chordName;
          inversion = i;
          break;
        }
      }
      
      if (found) break;
    }
    
    res.json({
      root: root || getNoteNameFromMidi(sortedNotes[0]).charAt(0),
      type,
      inversion,
      notes: sortedNotes.map(getNoteNameFromMidi)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
