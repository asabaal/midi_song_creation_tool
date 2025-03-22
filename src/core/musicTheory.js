/**
 * Music Theory module for MIDI Song Creation Tool
 * Provides core music theory functionality for scales, chords, and harmony
 */
// Note mapping for conversions
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_ALIASES = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};
// Scale definitions (semitone intervals)
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};
// Chord definitions (semitone intervals from root)
const CHORD_TYPES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
  augmented7: [0, 4, 8, 10],
  add9: [0, 4, 7, 14],
  add11: [0, 4, 7, 17],
};
// Roman numeral to scale degree mapping
const ROMAN_NUMERALS = {
  I: 0,
  II: 1,
  III: 2,
  IV: 3,
  V: 4,
  VI: 5,
  VII: 6,
  i: 0,
  ii: 1,
  iii: 2,
  iv: 3,
  v: 4,
  vi: 5,
  vii: 6,
};
// Fixed key signature mapping
const KEY_SIGNATURES = {
  'C major': { keySignature: 0, accidental: 'sharp' },
  'G major': { keySignature: 1, accidental: 'sharp' },
  'D major': { keySignature: 2, accidental: 'sharp' },
  'A major': { keySignature: 3, accidental: 'sharp' },
  'E major': { keySignature: 4, accidental: 'sharp' },
  'B major': { keySignature: 5, accidental: 'sharp' },
  'F# major': { keySignature: 6, accidental: 'sharp' },
  'C# major': { keySignature: 7, accidental: 'sharp' },
  'F major': { keySignature: 1, accidental: 'flat' },
  'Bb major': { keySignature: 2, accidental: 'flat' },
  'Eb major': { keySignature: 3, accidental: 'flat' },
  'Ab major': { keySignature: 4, accidental: 'flat' },
  'Db major': { keySignature: 5, accidental: 'flat' },
  'Gb major': { keySignature: 6, accidental: 'flat' },
  'Cb major': { keySignature: 7, accidental: 'flat' },
  'A minor': { keySignature: 0, accidental: 'sharp' },
  'E minor': { keySignature: 1, accidental: 'sharp' },
  'B minor': { keySignature: 2, accidental: 'sharp' },
  'F# minor': { keySignature: 3, accidental: 'sharp' },
  'C# minor': { keySignature: 4, accidental: 'sharp' },
  'G# minor': { keySignature: 5, accidental: 'sharp' },
  'D# minor': { keySignature: 6, accidental: 'sharp' },
  'A# minor': { keySignature: 7, accidental: 'sharp' },
  'D minor': { keySignature: 1, accidental: 'flat' },
  'G minor': { keySignature: 2, accidental: 'flat' },
  'C minor': { keySignature: 3, accidental: 'flat' },
  'F minor': { keySignature: 4, accidental: 'flat' },
  'Bb minor': { keySignature: 5, accidental: 'flat' },
  'Eb minor': { keySignature: 6, accidental: 'flat' },
  'Ab minor': { keySignature: 7, accidental: 'flat' },
};
/**
 * Converts a note name to MIDI note number
 * @param {string} noteName - Note name (e.g. 'C4', 'F#5')
 * @returns {number} MIDI note number
 */
function noteToMidi(noteName) {
  // Handle flat notes (convert to sharp equivalent)
  Object.keys(NOTE_ALIASES).forEach(flat => {
    noteName = noteName.replace(flat, NOTE_ALIASES[flat]);
  });
  // Extract note and octave
  const note = noteName.slice(0, -1);
  const octave = parseInt(noteName.slice(-1));
  // Calculate MIDI note number
  const noteIndex = NOTE_NAMES.indexOf(note);
  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${note}`);
  }
  return noteIndex + (octave + 1) * 12;
}
/**
 * Converts a MIDI note number to note name
 * @param {number} midiNote - MIDI note number
 * @returns {string} Note name (e.g. 'C4', 'F#5')
 */
function midiToNote(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return NOTE_NAMES[noteIndex] + octave;
}
/**
 * Generates a scale from a root note and scale type
 * @param {string} root - Root note name (e.g. 'C', 'F#')
 * @param {string} scaleType - Scale type (e.g. 'major', 'minor')
 * @param {number} octave - Starting octave number
 * @returns {number[]} Array of MIDI note numbers representing the scale
 */
function generateScale(root, scaleType, octave = 4) {
  if (!SCALES[scaleType]) {
    throw new Error(`Unknown scale type: ${scaleType}`);
  }
  const rootNote = noteToMidi(`${root}${octave}`);
  return SCALES[scaleType].map(interval => rootNote + interval);
}
/**
 * Generates a chord from a root note and chord type
 * @param {string} root - Root note name (e.g. 'C', 'F#')
 * @param {string} chordType - Chord type (e.g. 'major', 'minor7')
 * @param {number} octave - Starting octave number
 * @returns {number[]} Array of MIDI note numbers representing the chord
 */
function generateChord(root, chordType, octave = 4) {
  if (!CHORD_TYPES[chordType]) {
    throw new Error(`Unknown chord type: ${chordType}`);
  }
  const rootNote = noteToMidi(`${root}${octave}`);
  return CHORD_TYPES[chordType].map(interval => rootNote + interval);
}
/**
 * Determines the key signature (number of sharps/flats) for a given key
 * @param {string} key - Key name (e.g. 'C major', 'F# minor')
 * @returns {Object} Object with keySignature (number of sharps/flats) and accidental ('sharp' or 'flat')
 */
function getKeySignature(key) {
  if (!KEY_SIGNATURES[key]) {
    // Circle of fifths positions (C major = 0, moving clockwise adds sharps)
    const sharpKeys = {
      C: 0,
      G: 1,
      D: 2,
      A: 3,
      E: 4,
      B: 5,
      'F#': 6,
      'C#': 7,
    };
    const [root, mode] = key.split(' ');
    // Adjust for minor keys (relative minor is 3 semitones below major)
    let position;
    if (mode === 'major') {
      position = sharpKeys[root] || -sharpKeys[NOTE_ALIASES[root]];
    } else if (mode === 'minor') {
      // Relative major is 3 semitones above, or 9 semitones below
      const relativeMajor = NOTE_NAMES[(NOTE_NAMES.indexOf(root) + 3) % 12];
      position = sharpKeys[relativeMajor] || -sharpKeys[NOTE_ALIASES[relativeMajor]];
    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }
    // Negative positions are flat keys
    return {
      keySignature: Math.abs(position),
      accidental: position >= 0 ? 'sharp' : 'flat',
    };
  }
  // Use the predefined key signature mapping
  return KEY_SIGNATURES[key];
}
/**
 * Generates a chord progression from Roman numeral notation
 * @param {string[]} progression - Array of Roman numerals (e.g. ['I', 'IV', 'V', 'I'])
 * @param {string} key - Key name (e.g. 'C', 'F#')
 * @param {string} mode - Mode name (e.g. 'major', 'minor')
 * @param {number} octave - Starting octave
 * @returns {Array<Array<number>>} Array of chord arrays, each containing MIDI note numbers
 */
function generateChordProgression(progression, key, mode, octave = 4) {
  const scale = generateScale(key, mode, octave);
  // Make sure we have a complete scale with at least 7 notes for diatonic chords
  const fullScale = [...scale];
  if (fullScale.length < 7) {
    // Add next octave if needed
    const nextOctaveScale = generateScale(key, mode, octave + 1);
    for (let i = fullScale.length; i < 7; i++) {
      fullScale.push(nextOctaveScale[i - fullScale.length]);
    }
  }
  // For minor key, D is at position 5 from A (A, B, C, D, E) or index 3 in the scale
  const result = progression.map(numeral => {
    // Get scale degree from roman numeral
    let scaleDegree = ROMAN_NUMERALS[numeral];
    if (scaleDegree === undefined) {
      throw new Error(`Invalid Roman numeral: ${numeral}`);
    }
    // Get root note of chord from scale degree
    const rootNote = fullScale[scaleDegree];
    const rootName = midiToNote(rootNote).replace(/\d/, ''); // Remove octave number
    const chordOctave = Math.floor(rootNote / 12) - 1;
    // Determine chord type based on scale position and mode
    let chordType;
    // Adjust for major/minor chord types based on mode and position in the scale
    if (mode === 'major') {
      // In major keys: I, IV, V are major; ii, iii, vi are minor; vii° is diminished
      if ([0, 3, 4].includes(scaleDegree)) {
        chordType = 'major';
      } else if ([1, 2, 5].includes(scaleDegree)) {
        chordType = 'minor';
      } else {
        chordType = 'diminished';
      }
    } else if (mode === 'minor') {
      // In minor keys: i, iv, v are minor; III, VI, VII are major; ii° is diminished
      // Note: v could be minor or major (harmonic minor would make it major)
      if ([2, 5, 6].includes(scaleDegree)) {
        chordType = 'major';
      } else if ([0, 3, 4].includes(scaleDegree)) {
        chordType = 'minor';
      } else {
        chordType = 'diminished';
      }
    } else {
      // Default based on numeral case if mode is not recognized
      chordType = numeral === numeral.toUpperCase() ? 'major' : 'minor';
    }
    // Generate the chord
    return generateChord(rootName, chordType, chordOctave);
  });
  return result;
}
module.exports = {
  noteToMidi,
  midiToNote,
  generateScale,
  generateChord,
  getKeySignature,
  generateChordProgression,
  NOTE_NAMES,
  SCALES,
  CHORD_TYPES,
};
