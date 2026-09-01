/**
 * Tests for chord progression generator
 */

const ChordProgressionGenerator = require('../../../src/core/chordProgressionGenerator');

describe('Chord Progression Generator', () => {
  let generator;
  
  beforeEach(() => {
    generator = new ChordProgressionGenerator();
  });

  describe('generateProgression', () => {
    test('should generate a basic progression', () => {
      const key = 'C major';
      const chords = [
        { name: 'C major', duration: '1/4' },
        { name: 'F major', duration: '1/4' },
        { name: 'G major', duration: '1/4' },
        { name: 'C major', duration: '1/4' }
      ];
      const result = generator.generateProgression(key, chords);
      
      expect(result).toHaveProperty('key', 'C major');
      expect(result).toHaveProperty('progression');
      expect(result.progression).toHaveLength(4);
      expect(result.progression[0]).toHaveProperty('name', 'C major');
    });

    test('should handle minor keys', () => {
      const key = 'A minor';
      const chords = [
        { name: 'A minor', duration: '1/4' },
        { name: 'D minor', duration: '1/4' },
        { name: 'E minor', duration: '1/4' },
        { name: 'A minor', duration: '1/4' }
      ];
      const result = generator.generateProgression(key, chords);
      
      expect(result.key).toBe('A minor');
      expect(result.progression[0].name).toBe('A minor');
    });

    test('should throw error for invalid progression', () => {
      expect(() => {
        generator.generateProgression('C major', []);
      }).toThrow();
    });
  });

  describe('generateCommonProgressions', () => {
    test('should generate common progressions', () => {
      const key = 'C major';
      const result = generator.generateCommonProgressions(key);
      
      expect(result).toHaveProperty('key', 'C major');
      expect(result).toHaveProperty('commonProgressions');
      expect(Array.isArray(result.commonProgressions)).toBe(true);
      expect(result.commonProgressions.length).toBeGreaterThan(0);
    });
  });

  describe('createMidiFile', () => {
    test('should create MIDI file from progression', () => {
      const progression = {
        key: 'C major',
        progression: [
          { name: 'C major', midiNotes: [60, 64, 67], duration: '1/4' },
          { name: 'G major', midiNotes: [67, 71, 74], duration: '1/4' }
        ]
      };
      
      const midiData = generator.createMidiFile(progression, { tempo: 120 });
      
      expect(midiData).toBeDefined();
      expect(typeof midiData).toBe('string');
      expect(midiData.length).toBeGreaterThan(0);
    });
  });

  describe('validateProgression', () => {
    test('should validate correct progression', () => {
      const key = 'C major';
      const chords = [
        { name: 'C major', duration: '1/4' },
        { name: 'F major', duration: '1/4' },
        { name: 'G major', duration: '1/4' },
        { name: 'C major', duration: '1/4' }
      ];
      const result = generator.validateProgression(key, chords);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});