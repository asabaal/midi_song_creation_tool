// tests/unit/core/musicTheory.test.js
const {
  noteToMidi,
  midiToNote,
  generateScale,
  generateChord,
  getKeySignature,
  generateChordProgression,
  NOTE_NAMES,
  SCALES,
  CHORD_TYPES
} = require('../../../src/core/musicTheory');

describe('Music Theory Module', () => {
  describe('Note Conversion', () => {
    test('should convert note names to MIDI note numbers', () => {
      expect(noteToMidi('C4')).toBe(60);
      expect(noteToMidi('C#4')).toBe(61);
      expect(noteToMidi('D4')).toBe(62);
      expect(noteToMidi('E4')).toBe(64);
      expect(noteToMidi('F4')).toBe(65);
      expect(noteToMidi('G4')).toBe(67);
      expect(noteToMidi('A4')).toBe(69);
      expect(noteToMidi('B4')).toBe(71);
      expect(noteToMidi('C5')).toBe(72);
    });

    test('should handle flat note names', () => {
      expect(noteToMidi('Db4')).toBe(61); // Same as C#4
      expect(noteToMidi('Eb4')).toBe(63); // Same as D#4
      expect(noteToMidi('Bb4')).toBe(70); // Same as A#4
    });

    test('should handle different octaves', () => {
      expect(noteToMidi('C0')).toBe(12);
      expect(noteToMidi('C1')).toBe(24);
      expect(noteToMidi('C2')).toBe(36);
      expect(noteToMidi('C3')).toBe(48);
      expect(noteToMidi('C4')).toBe(60);
      expect(noteToMidi('C5')).toBe(72);
      expect(noteToMidi('C6')).toBe(84);
      expect(noteToMidi('C7')).toBe(96);
      expect(noteToMidi('C8')).toBe(108);
    });

    test('should throw error for invalid note names', () => {
      expect(() => noteToMidi('H4')).toThrow(); // H is not a valid note name
      expect(() => noteToMidi('C')).toThrow(); // Missing octave
    });

    test('should convert MIDI note numbers to note names', () => {
      expect(midiToNote(60)).toBe('C4');
      expect(midiToNote(61)).toBe('C#4');
      expect(midiToNote(62)).toBe('D4');
      expect(midiToNote(64)).toBe('E4');
      expect(midiToNote(65)).toBe('F4');
      expect(midiToNote(67)).toBe('G4');
      expect(midiToNote(69)).toBe('A4');
      expect(midiToNote(71)).toBe('B4');
      expect(midiToNote(72)).toBe('C5');
    });

    test('should be able to convert back and forth', () => {
      const testNotes = ['C3', 'D#4', 'F#5', 'Bb2', 'G7'];
      testNotes.forEach(note => {
        expect(midiToNote(noteToMidi(note))).toBe(note.replace('b', '#'));
      });
    });
  });

  describe('Scale Generation', () => {
    test('should generate major scale correctly', () => {
      const cMajorScale = generateScale('C', 'major', 4);
      expect(cMajorScale).toEqual([60, 62, 64, 65, 67, 69, 71]);
    });

    test('should generate minor scale correctly', () => {
      const aMinorScale = generateScale('A', 'minor', 4);
      expect(aMinorScale).toEqual([69, 71, 72, 74, 76, 77, 79]);
    });

    test('should generate pentatonic scale correctly', () => {
      const cPentatonic = generateScale('C', 'pentatonicMajor', 4);
      expect(cPentatonic).toEqual([60, 62, 64, 67, 69]);

      const aMinorPentatonic = generateScale('A', 'pentatonicMinor', 4);
      expect(aMinorPentatonic).toEqual([69, 72, 74, 76, 79]);
    });

    test('should generate blues scale correctly', () => {
      const cBluesScale = generateScale('C', 'blues', 4);
      expect(cBluesScale).toEqual([60, 63, 65, 66, 67, 70]);
    });

    test('should generate modal scales correctly', () => {
      const dDorian = generateScale('D', 'dorian', 4);
      expect(dDorian).toEqual([62, 64, 65, 67, 69, 71, 72]);

      const ePhrygian = generateScale('E', 'phrygian', 4);
      expect(ePhrygian).toEqual([64, 65, 67, 69, 71, 72, 74]);

      const fLydian = generateScale('F', 'lydian', 4);
      expect(fLydian).toEqual([65, 67, 69, 71, 72, 74, 76]);

      const gMixolydian = generateScale('G', 'mixolydian', 4);
      expect(gMixolydian).toEqual([67, 69, 71, 72, 74, 76, 77]);
    });

    test('should throw error for unknown scale type', () => {
      expect(() => generateScale('C', 'unknownScale', 4)).toThrow();
    });
  });

  describe('Chord Generation', () => {
    test('should generate major chord correctly', () => {
      const cMajor = generateChord('C', 'major', 4);
      expect(cMajor).toEqual([60, 64, 67]); // C E G
    });

    test('should generate minor chord correctly', () => {
      const cMinor = generateChord('C', 'minor', 4);
      expect(cMinor).toEqual([60, 63, 67]); // C Eb G
    });

    test('should generate seventh chords correctly', () => {
      const cMaj7 = generateChord('C', 'major7', 4);
      expect(cMaj7).toEqual([60, 64, 67, 71]); // C E G B

      const cDom7 = generateChord('C', 'dominant7', 4);
      expect(cDom7).toEqual([60, 64, 67, 70]); // C E G Bb

      const cMin7 = generateChord('C', 'minor7', 4);
      expect(cMin7).toEqual([60, 63, 67, 70]); // C Eb G Bb
    });

    test('should generate diminished and augmented chords correctly', () => {
      const cDim = generateChord('C', 'diminished', 4);
      expect(cDim).toEqual([60, 63, 66]); // C Eb Gb

      const cAug = generateChord('C', 'augmented', 4);
      expect(cAug).toEqual([60, 64, 68]); // C E G#
    });

    test('should generate suspended chords correctly', () => {
      const cSus2 = generateChord('C', 'sus2', 4);
      expect(cSus2).toEqual([60, 62, 67]); // C D G

      const cSus4 = generateChord('C', 'sus4', 4);
      expect(cSus4).toEqual([60, 65, 67]); // C F G
    });

    test('should throw error for unknown chord type', () => {
      expect(() => generateChord('C', 'unknownChord', 4)).toThrow();
    });
  });

  describe('Key Signature', () => {
    test('should return correct key signature for major keys', () => {
      // C major - 0 sharps/flats
      expect(getKeySignature('C major')).toEqual({
        keySignature: 0,
        accidental: 'sharp'
      });

      // G major - 1 sharp
      expect(getKeySignature('G major')).toEqual({
        keySignature: 1,
        accidental: 'sharp'
      });

      // F major - 1 flat
      expect(getKeySignature('F major')).toEqual({
        keySignature: 1,
        accidental: 'flat'
      });

      // B major - 5 sharps
      expect(getKeySignature('B major')).toEqual({
        keySignature: 5,
        accidental: 'sharp'
      });

      // Eb major - 3 flats
      expect(getKeySignature('Eb major')).toEqual({
        keySignature: 3,
        accidental: 'flat'
      });
    });

    test('should return correct key signature for minor keys', () => {
      // A minor - 0 sharps/flats (relative to C major)
      expect(getKeySignature('A minor')).toEqual({
        keySignature: 0,
        accidental: 'sharp'
      });

      // E minor - 1 sharp (relative to G major)
      expect(getKeySignature('E minor')).toEqual({
        keySignature: 1,
        accidental: 'sharp'
      });

      // D minor - 1 flat (relative to F major)
      expect(getKeySignature('D minor')).toEqual({
        keySignature: 1,
        accidental: 'flat'
      });
    });

    test('should throw error for invalid mode', () => {
      expect(() => getKeySignature('C dorian')).toThrow();
    });
  });

  describe('Chord Progression', () => {
    test('should generate a I-IV-V-I progression in C major', () => {
      const progression = generateChordProgression(['I', 'IV', 'V', 'I'], 'C', 'major', 4);
      
      // C major chord
      expect(progression[0]).toContain(60); // C
      expect(progression[0]).toContain(64); // E
      expect(progression[0]).toContain(67); // G
      
      // F major chord
      expect(progression[1]).toContain(65); // F
      expect(progression[1]).toContain(69); // A
      expect(progression[1]).toContain(72); // C
      
      // G major chord
      expect(progression[2]).toContain(67); // G
      expect(progression[2]).toContain(71); // B
      expect(progression[2]).toContain(74); // D
      
      // C major chord again
      expect(progression[3]).toContain(60); // C
      expect(progression[3]).toContain(64); // E
      expect(progression[3]).toContain(67); // G
    });
    
    test('should generate a i-iv-v-i progression in A minor', () => {
      const progression = generateChordProgression(['i', 'iv', 'v', 'i'], 'A', 'minor', 4);
      
      // A minor chord
      expect(progression[0]).toContain(69); // A
      expect(progression[0]).toContain(72); // C
      expect(progression[0]).toContain(76); // E
      
      // D minor chord
      expect(progression[1]).toContain(62); // D
      expect(progression[1]).toContain(65); // F
      expect(progression[1]).toContain(69); // A
      
      // E minor chord (in a minor context)
      expect(progression[2]).toContain(64); // E
      expect(progression[2]).toContain(67); // G
      expect(progression[2]).toContain(71); // B
      
      // A minor chord again
      expect(progression[3]).toContain(69); // A
      expect(progression[3]).toContain(72); // C
      expect(progression[3]).toContain(76); // E
    });
    
    test('should throw error for invalid Roman numeral', () => {
      expect(() => generateChordProgression(['I', 'VIII', 'V'], 'C', 'major')).toThrow();
    });
  });
});
