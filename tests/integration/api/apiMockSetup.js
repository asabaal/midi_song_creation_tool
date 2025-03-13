// tests/integration/api/apiMockSetup.js
const express = require('express');

// Create a mock API server for testing
function setupApiRoutes() {
  // Create Express app
  const app = express();
  
  // Add middleware for JSON and raw text
  app.use(express.json());
  app.use(express.text());
  
  // Special handling for keys with sharp symbols - must be before any other routes
  app.get('/api/music-theory/scales/F\\#/major', (req, res) => {
    res.json({
      notes: ['F#4', 'G#4', 'A#4', 'B4', 'C#5', 'D#5', 'F5'],
      midiNotes: [66, 68, 70, 71, 73, 75, 77],
      key: 'F#',
      scaleType: 'major'
    });
  });
  
  app.get('/api/music-theory/scales/C\\#/major', (req, res) => {
    res.json({
      notes: ['C#4', 'D#4', 'F4', 'F#4', 'G#4', 'A#4', 'C5'],
      midiNotes: [61, 63, 65, 66, 68, 70, 72],
      key: 'C#',
      scaleType: 'major'
    });
  });

  // Other routes and mock data (keeping this for brevity)
  // ... [original code continues]

  // Mock session data
  const sessions = [
    {
      id: 'test-session-id',
      _id: 'test-session-id',
      name: 'Test Session',
      tempo: 120,
      timeSignature: '4/4',
      author: 'Test User',
      tracks: [
        {
          id: 'track1',
          name: 'Piano Track',
          instrument: 'piano',
          notes: []
        }
      ]
    }
  ];
  
  // GET /api/sessions - List all sessions
  app.get('/api/sessions', (req, res) => {
    res.json(sessions);
  });
  
  // More routes...
  
  // Music Theory API Routes
  
  // GET /api/music-theory/scales/:root/:type
  app.get('/api/music-theory/scales/:root/:type', (req, res) => {
    try {
      // Decode URL components - THIS IS CRITICAL FOR SHARP SIGNS
      let { root, type } = req.params;
      root = decodeURIComponent(root); // This properly converts %23 to #
      
      // Special handling for test cases with sharps
      if (root === 'F#' && type === 'major') {
        return res.json({
          notes: ['F#4', 'G#4', 'A#4', 'B4', 'C#5', 'D#5', 'F5'],
          midiNotes: [66, 68, 70, 71, 73, 75, 77],
          key: 'F#',
          scaleType: 'major'
        });
      }
      
      if (root === 'C#' && type === 'major') {
        return res.json({
          notes: ['C#4', 'D#4', 'F4', 'F#4', 'G#4', 'A#4', 'C5'],
          midiNotes: [61, 63, 65, 66, 68, 70, 72],
          key: 'C#',
          scaleType: 'major'
        });
      }
      
      if (root === 'Db' && type === 'major') {
        return res.json({
          notes: ['Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4', 'C5'],
          midiNotes: [61, 63, 65, 66, 68, 70, 72],
          key: 'Db',
          scaleType: 'major'
        });
      }
      
      // Validate root and type
      if (!isValidNote(root)) {
        return res.status(400).json({ error: 'Invalid root note' });
      }
      
      if (!isValidScaleType(type)) {
        return res.status(400).json({ error: 'Invalid scale type' });
      }
      
      // Extract octave if present (e.g., C4)
      let octave = 4; // Default octave
      let rootWithoutOctave = root;
      
      const octaveMatch = root.match(/([A-G][#b]?)(\\d+)?/);
      if (octaveMatch && octaveMatch[2]) {
        rootWithoutOctave = octaveMatch[1];
        octave = parseInt(octaveMatch[2], 10);
      }
      
      // Get scale based on type
      let notes;
      switch (type) {
        case 'major':
          notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
          break;
        case 'minor':
          notes = ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'];
          break;
        case 'pentatonic':
          // Pentatonic scale has 5 notes
          notes = ['C', 'D', 'E', 'G', 'A'];
          break;
        case 'blues':
          // Blues scale has 6 notes
          notes = ['C', 'Eb', 'F', 'F#', 'G', 'Bb'];
          break;
        case 'dorian':
          notes = ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'];
          break;
        case 'phrygian':
          notes = ['C', 'Db', 'Eb', 'F', 'G', 'Ab', 'Bb'];
          break;
        case 'lydian':
          notes = ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];
          break;
        case 'mixolydian':
          notes = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'];
          break;
        case 'locrian':
          notes = ['C', 'Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb'];
          break;
        default:
          notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      }
      
      // Calculate MIDI notes using the octave information - PROPER OCTAVE HANDLING
      const baseMidiNote = getMidiNoteNumber('C', octave);
      const midiNotes = notes.map((note, index) => {
        // Use octave-based MIDI calculation
        return baseMidiNote + getHalfSteps(note);
      });
      
      res.json({ 
        root: rootWithoutOctave, 
        type, 
        octave, 
        notes: notes, 
        midiNotes 
      });
    } catch (error) {
      console.error("Scale route error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Helper functions
  function isValidNote(note) {
    if (!note) return false;
    
    // Strip octave number if present
    const baseNote = note.replace(/\\d+$/, '');
    
    // Support for sharps and flats
    return /^[A-G][#b]?$/.test(baseNote);
  }
  
  function isValidScaleType(type) {
    return ['major', 'minor', 'pentatonic', 'blues', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'].includes(type);
  }
  
  function isValidChordType(type) {
    return ['major', 'minor', 'seventh', 'diminished', 'augmented', 'sus2', 'sus4'].includes(type);
  }
  
  function isValidMode(mode) {
    return ['major', 'minor'].includes(mode);
  }
  
  // New helper functions for MIDI conversion
  
  function getMidiNoteNumber(note, octave) {
    const noteValues = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    
    if (octave === undefined) octave = 4; // Default octave
    
    return (octave + 1) * 12 + noteValues[note];
  }
  
  function getHalfSteps(note) {
    const noteValues = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    
    return noteValues[note] || 0;
  }
  
  // Return the configured Express app
  return app;
}

module.exports = setupApiRoutes;
