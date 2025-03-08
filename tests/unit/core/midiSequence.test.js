// tests/unit/core/midiSequence.test.js
const { MidiSequence } = require('../../../src/core/midiSequence');

describe('MidiSequence', () => {
  let sequence;
  
  beforeEach(() => {
    // Setup a new sequence before each test
    sequence = new MidiSequence({
      bpm: 120,
      timeSignature: [4, 4],
      tracks: []
    });
  });
  
  test('should initialize with correct default values', () => {
    expect(sequence.bpm).toBe(120);
    expect(sequence.timeSignature).toEqual([4, 4]);
    expect(sequence.tracks).toEqual([]);
  });
  
  test('should add a note correctly', () => {
    sequence.addNote({
      trackId: 0,
      pitch: 60, // Middle C
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    // Create a new track if it doesn't exist
    expect(sequence.tracks.length).toBe(1);
    expect(sequence.tracks[0].notes.length).toBe(1);
    expect(sequence.tracks[0].notes[0]).toEqual({
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
  });
  
  test('should remove a note correctly', () => {
    // Add a note first
    sequence.addNote({
      trackId: 0,
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    // Then remove it
    sequence.removeNote({
      trackId: 0,
      index: 0
    });
    
    expect(sequence.tracks[0].notes.length).toBe(0);
  });
  
  test('should calculate sequence duration correctly', () => {
    sequence.addNote({
      trackId: 0,
      pitch: 60,
      startTime: 0,
      duration: 2,
      velocity: 100
    });
    
    sequence.addNote({
      trackId: 0,
      pitch: 62,
      startTime: 3,
      duration: 1,
      velocity: 100
    });
    
    expect(sequence.getDuration()).toBe(4); // 3 (start time) + 1 (duration) = 4
  });
  
  test('should quantize notes correctly', () => {
    sequence.addNote({
      trackId: 0,
      pitch: 60,
      startTime: 0.95, // Should round to 1
      duration: 0.45,  // Should round to 0.5
      velocity: 100
    });
    
    sequence.quantizeNotes(0.5); // Quantize to half notes
    
    expect(sequence.tracks[0].notes[0].startTime).toBe(1);
    expect(sequence.tracks[0].notes[0].duration).toBe(0.5);
  });
  
  test('should transpose notes correctly', () => {
    sequence.addNote({
      trackId: 0,
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    sequence.transposeTrack(0, 12); // Transpose up an octave
    
    expect(sequence.tracks[0].notes[0].pitch).toBe(72);
  });
  
  test('should handle note collisions', () => {
    sequence.addNote({
      trackId: 0,
      pitch: 60,
      startTime: 0,
      duration: 2,
      velocity: 100
    });
    
    // This note overlaps with the previous one
    const hasCollision = sequence.wouldCollide({
      trackId: 0,
      pitch: 60,
      startTime: 1,
      duration: 2
    });
    
    expect(hasCollision).toBeTruthy();
  });
});