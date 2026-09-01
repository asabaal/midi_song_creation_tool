// src/server/routes/chordProgressionRoutes.js

const express = require('express');
const router = express.Router();
const ChordProgressionGenerator = require('../../core/chordProgressionGenerator');
const {
  generateDiatonicChords,
  analyzeChord,
  validateCustomChord
} = require('../../core/musicTheory');

// Initialize the generator
const generator = new ChordProgressionGenerator();

/**
 * GET /api/chord-progression/diatonic-chords/:key
 * Returns available diatonic chords for a given key
 */
router.get('/diatonic-chords/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required',
        example: '/api/chord-progression/diatonic-chords/C major'
      });
    }
    
    // Decode URL-encoded key (handle spaces and special characters)
    const decodedKey = decodeURIComponent(key);
    
    // Generate diatonic chords
    const diatonicChords = generateDiatonicChords(decodedKey);
    
    res.json({
      key: decodedKey,
      chords: diatonicChords,
      count: diatonicChords.length
    });
  } catch (error) {
    console.error('Error getting diatonic chords:', error);
    res.status(500).json({
      error: 'Failed to generate diatonic chords',
      message: error.message
    });
  }
});

/**
 * POST /api/chord-progression/analyze-custom
 * Analyzes user-selected notes for chord type detection
 */
router.post('/analyze-custom', (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({
        error: 'Notes array is required',
        example: { notes: ['C4', 'E4', 'G4'] }
      });
    }
    
    // Validate the custom chord
    const validation = validateCustomChord(notes);
    
    // Analyze the chord
    const analysis = analyzeChord(notes);
    
    res.json({
      notes,
      validation,
      analysis,
      noteCount: notes.length
    });
  } catch (error) {
    console.error('Error analyzing custom chord:', error);
    res.status(500).json({
      error: 'Failed to analyze custom chord',
      message: error.message
    });
  }
});

/**
 * POST /api/chord-progression/generate
 * Generates MIDI data from a chord progression
 */
router.post('/generate', (req, res) => {
  try {
    const { key, chords, tempo = 120 } = req.body;
    
    if (!key) {
      return res.status(400).json({
        error: 'Key is required',
        example: 'C major'
      });
    }
    
    if (!chords || !Array.isArray(chords) || chords.length === 0) {
      return res.status(400).json({
        error: 'Chords array is required',
        example: [
          { name: 'C major', duration: '1' },
          { name: 'G major', duration: '1' },
          { name: 'A minor', duration: '1' },
          { name: 'F major', duration: '1' }
        ]
      });
    }
    
    // Validate chord structure
    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      if (!chord.name && !chord.custom) {
        return res.status(400).json({
          error: `Chord at position ${i + 1} must have a name or be marked as custom`,
          chord
        });
      }
      
      if (!chord.duration) {
        return res.status(400).json({
          error: `Chord at position ${i + 1} must have a duration`,
          chord
        });
      }
    }
    
    // Generate the progression
    const progression = generator.generateProgression(key, chords, tempo);
    
    // Analyze the progression
    const analysis = generator.analyzeProgression(progression);
    
    res.json({
      progression,
      analysis,
      success: true
    });
  } catch (error) {
    console.error('Error generating progression:', error);
    res.status(500).json({
      error: 'Failed to generate progression',
      message: error.message
    });
  }
});

/**
 * POST /api/chord-progression/export
 * Exports a progression as a MIDI file
 */
router.post('/export', (req, res) => {
  try {
    const { progression, format = 'midi' } = req.body;
    
    if (!progression) {
      return res.status(400).json({
        error: 'Progression data is required',
        example: {
          key: 'C major',
          tempo: 120,
          chords: [
            { name: 'C major', duration: '1' },
            { name: 'G major', duration: '1' }
          ]
        }
      });
    }
    
    if (format !== 'midi') {
      return res.status(400).json({
        error: 'Only MIDI format is currently supported',
        supportedFormats: ['midi']
      });
    }
    
    // Export to MIDI
    const midiData = generator.exportToMIDI(progression);
    
    res.json({
      ...midiData,
      format,
      success: true
    });
  } catch (error) {
    console.error('Error exporting progression:', error);
    res.status(500).json({
      error: 'Failed to export progression',
      message: error.message
    });
  }
});

/**
 * GET /api/chord-progression/keys
 * Returns list of all supported keys
 */
router.get('/keys', (req, res) => {
  try {
    const majorKeys = [
      'C major', 'G major', 'D major', 'A major', 'E major', 'B major',
      'F# major', 'C# major', 'F major', 'Bb major', 'Eb major', 'Ab major',
      'Db major', 'Gb major', 'Cb major'
    ];
    
    const minorKeys = [
      'A minor', 'E minor', 'B minor', 'F# minor', 'C# minor', 'G# minor',
      'D# minor', 'A# minor', 'D minor', 'G minor', 'C minor', 'F minor',
      'Bb minor', 'Eb minor', 'Ab minor'
    ];
    
    res.json({
      major: majorKeys,
      minor: minorKeys,
      all: [...majorKeys, ...minorKeys],
      total: majorKeys.length + minorKeys.length
    });
  } catch (error) {
    console.error('Error getting keys:', error);
    res.status(500).json({
      error: 'Failed to get keys',
      message: error.message
    });
  }
});

/**
 * GET /api/chord-progression/chord-types
 * Returns list of supported chord types
 */
router.get('/chord-types', (req, res) => {
  try {
    const { CHORD_TYPES } = require('../../core/musicTheory');
    
    const chordTypes = Object.keys(CHORD_TYPES).map(type => ({
      name: type,
      intervals: CHORD_TYPES[type],
      description: getChordTypeDescription(type)
    }));
    
    res.json({
      chordTypes,
      count: chordTypes.length
    });
  } catch (error) {
    console.error('Error getting chord types:', error);
    res.status(500).json({
      error: 'Failed to get chord types',
      message: error.message
    });
  }
});

/**
 * POST /api/chord-progression/validate
 * Validates a complete progression
 */
router.post('/validate', (req, res) => {
  try {
    const { key, chords, tempo = 120 } = req.body;
    
    if (!key || !chords || !Array.isArray(chords)) {
      return res.status(400).json({
        error: 'Key and chords array are required'
      });
    }
    
    const validationResults = [];
    let hasErrors = false;
    
    // Validate each chord
    chords.forEach((chord, index) => {
      const chordValidation = {
        position: index + 1,
        chord: chord.name || 'Custom',
        isValid: true,
        errors: [],
        warnings: []
      };
      
      // Check required fields
      if (!chord.name && !chord.custom) {
        chordValidation.isValid = false;
        chordValidation.errors.push('Chord must have a name or be marked as custom');
        hasErrors = true;
      }
      
      if (!chord.duration) {
        chordValidation.isValid = false;
        chordValidation.errors.push('Chord must have a duration');
        hasErrors = true;
      }
      
      // Validate custom chords
      if (chord.custom && chord.notes) {
        const customValidation = validateCustomChord(chord.notes);
        if (!customValidation.isValid) {
          chordValidation.isValid = false;
          chordValidation.errors.push(...customValidation.errors);
          hasErrors = true;
        }
        chordValidation.warnings.push(...customValidation.suggestions);
      }
      
      validationResults.push(chordValidation);
    });
    
    res.json({
      isValid: !hasErrors,
      validationResults,
      summary: {
        totalChords: chords.length,
        validChords: validationResults.filter(v => v.isValid).length,
        errorCount: validationResults.reduce((sum, v) => sum + v.errors.length, 0),
        warningCount: validationResults.reduce((sum, v) => sum + v.warnings.length, 0)
      }
    });
  } catch (error) {
    console.error('Error validating progression:', error);
    res.status(500).json({
      error: 'Failed to validate progression',
      message: error.message
    });
  }
});

/**
 * Helper function to get chord type descriptions
 */
function getChordTypeDescription(type) {
  const descriptions = {
    major: 'Major triad - bright, happy sound',
    minor: 'Minor triad - dark, sad sound',
    diminished: 'Diminished triad - tense, unstable',
    augmented: 'Augmented triad - dreamy, unsettled',
    sus2: 'Suspended 2nd - unresolved, modern',
    sus4: 'Suspended 4th - unresolved, classic',
    major7: 'Major 7th - jazzy, sophisticated',
    minor7: 'Minor 7th - smooth, soulful',
    dominant7: 'Dominant 7th - bluesy, needs resolution',
    seventh: 'Dominant 7th - bluesy, needs resolution',
    diminished7: 'Diminished 7th - very tense, dramatic',
    halfDiminished7: 'Half-diminished 7th - complex, jazzy',
    augmented7: 'Augmented 7th - tense, bluesy',
    add9: 'Added 9th - colorful, modern',
    add11: 'Added 11th - open, spacious'
  };
  
  return descriptions[type] || 'Custom chord type';
}

module.exports = router;