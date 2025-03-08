// tests/unit/core/patternGenerator.test.js
const { ChordGenerator, BasslineGenerator, DrumPatternGenerator } = require('../../../src/core/patternGenerator');

describe('Pattern Generators', () => {
  describe('ChordGenerator', () => {
    let chordGenerator;
    
    beforeEach(() => {
      chordGenerator = new ChordGenerator();
    });
    
    test('should generate major chord correctly', () => {
      const chord = chordGenerator.generateChord('C', 'major', 4);
      
      expect(chord.length).toBe(3); // Major chord has 3 notes
      
      // Check if notes are correct (C-E-G in MIDI notes)
      expect(chord[0].pitch).toBe(60); // C4
      expect(chord[1].pitch).toBe(64); // E4
      expect(chord[2].pitch).toBe(67); // G4
    });
    
    test('should generate minor chord correctly', () => {
      const chord = chordGenerator.generateChord('A', 'minor', 4);
      
      expect(chord.length).toBe(3);
      
      // Check if notes are correct (A-C-E in MIDI notes)
      expect(chord[0].pitch).toBe(69); // A4
      expect(chord[1].pitch).toBe(72); // C5
      expect(chord[2].pitch).toBe(76); // E5
    });
    
    test('should generate chord progression', () => {
      const progression = chordGenerator.generateProgression(['I', 'IV', 'V', 'I'], 'C', 'major', 4);
      
      expect(progression.length).toBe(4); // 4 chords
      
      // Check progression (C, F, G, C in C major)
      const roots = progression.map(chord => chord[0].pitch);
      expect(roots[0]).toBe(60); // C4
      expect(roots[1]).toBe(65); // F4
      expect(roots[2]).toBe(67); // G4
      expect(roots[3]).toBe(60); // C4
    });
    
    test('should handle invalid chord type', () => {
      expect(() => {
        chordGenerator.generateChord('C', 'invalid', 4);
      }).toThrow();
    });
  });
  
  describe('BasslineGenerator', () => {
    let bassGenerator;
    
    beforeEach(() => {
      bassGenerator = new BasslineGenerator();
    });
    
    test('should generate walking bassline', () => {
      const chordProgressionRoots = [60, 65, 67, 60]; // C, F, G, C
      const bassline = bassGenerator.generateWalking(chordProgressionRoots, 4, 1);
      
      expect(bassline.length).toBe(16); // 4 chords × 4 notes per chord
      
      // Check first note of each chord matches chord root
      expect(bassline[0].pitch).toBe(60 - 12); // C3
      expect(bassline[4].pitch).toBe(65 - 12); // F3
      expect(bassline[8].pitch).toBe(67 - 12); // G3
      expect(bassline[12].pitch).toBe(60 - 12); // C3
    });
    
    test('should generate pattern bassline', () => {
      const chordProgressionRoots = [60, 65]; // C, F
      const pattern = [0, 5, 7, 5]; // Root, fifth, seventh, fifth
      const bassline = bassGenerator.generatePattern(chordProgressionRoots, pattern, 3, 0.5);
      
      expect(bassline.length).toBe(8); // 2 chords × 4 notes per pattern
      
      // Verify pattern notes for C chord (first 4 notes)
      expect(bassline[0].pitch).toBe(48); // C3
      expect(bassline[1].pitch).toBe(55); // G3
      expect(bassline[2].pitch).toBe(59); // B3
      expect(bassline[3].pitch).toBe(55); // G3
    });
  });
  
  describe('DrumPatternGenerator', () => {
    let drumGenerator;
    
    beforeEach(() => {
      drumGenerator = new DrumPatternGenerator();
    });
    
    test('should generate basic drum pattern', () => {
      const pattern = drumGenerator.generateBasicBeat(4, 4);
      
      // Expect kick on beats 1 and 3
      expect(pattern.kick.find(note => note.startTime === 0)).toBeTruthy();
      expect(pattern.kick.find(note => note.startTime === 2)).toBeTruthy();
      
      // Expect snare on beats 2 and 4
      expect(pattern.snare.find(note => note.startTime === 1)).toBeTruthy();
      expect(pattern.snare.find(note => note.startTime === 3)).toBeTruthy();
      
      // Expect hihat on every beat or eighth note
      expect(pattern.hihat.length).toBeGreaterThanOrEqual(4);
    });
    
    test('should handle different time signatures', () => {
      const pattern = drumGenerator.generateBasicBeat(3, 4); // 3/4 time
      
      // In 3/4, typically kick on 1, snare on 3
      expect(pattern.kick.find(note => note.startTime === 0)).toBeTruthy();
      expect(pattern.snare.find(note => note.startTime === 2)).toBeTruthy();
      
      expect(pattern.kick.length + pattern.snare.length + pattern.hihat.length).toBeGreaterThan(0);
    });
    
    test('should generate fill patterns', () => {
      const fill = drumGenerator.generateFill(1); // 1 bar fill
      
      // Fill should have more snare and tom hits
      expect(fill.snare.length + fill.tom.length).toBeGreaterThan(0);
    });
  });
});