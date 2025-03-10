// tests/unit/core/midiSequence.test.js
const MidiSequence = require('../../../src/core/midiSequence');

describe('MidiSequence', () => {
  let sequence;
  
  beforeEach(() => {
    // Setup a new sequence before each test
    sequence = new MidiSequence({
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 }
    });
  });
  
  test('should initialize with correct default values', () => {
    expect(sequence.tempo).toBe(120);
    expect(sequence.timeSignature).toEqual({ numerator: 4, denominator: 4 });
    expect(sequence.tracks.length).toBe(1); // Default track
  });
  
  test('should add a note correctly', () => {
    const trackIndex = 0;
    sequence.addNote(trackIndex, {
      pitch: 60, // Middle C
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    expect(sequence.tracks[trackIndex].notes.length).toBe(1);
    expect(sequence.tracks[trackIndex].notes[0].pitch).toBe(60);
    expect(sequence.tracks[trackIndex].notes[0].startTime).toBe(0);
    expect(sequence.tracks[trackIndex].notes[0].duration).toBe(1);
    expect(sequence.tracks[trackIndex].notes[0].velocity).toBe(100);
  });
  
  test('should remove a note correctly', () => {
    const trackIndex = 0;
    // Add a note first
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    // Then remove it
    const result = sequence.removeNote(trackIndex, 0);
    
    expect(result).toBe(true);
    expect(sequence.tracks[trackIndex].notes.length).toBe(0);
  });
  
  test('should calculate sequence duration correctly', () => {
    const trackIndex = 0;
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0,
      duration: 2,
      velocity: 100
    });
    
    sequence.addNote(trackIndex, {
      pitch: 62,
      startTime: 3,
      duration: 1,
      velocity: 100
    });
    
    expect(sequence.getDuration()).toBe(4); // 3 (start time) + 1 (duration) = 4
  });
  
  test('should quantize notes correctly', () => {
    const trackIndex = 0;
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0.95, // Should round to 1
      duration: 0.45,  // Should round to 0.5
      velocity: 100
    });
    
    sequence.quantizeNotes(0.5); // Quantize to half notes
    
    expect(sequence.tracks[trackIndex].notes[0].startTime).toBe(1);
    expect(sequence.tracks[trackIndex].notes[0].duration).toBe(0.5);
  });
  
  test('should transpose notes correctly', () => {
    const trackIndex = 0;
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    sequence.transpose(12); // Transpose up an octave
    
    expect(sequence.tracks[trackIndex].notes[0].pitch).toBe(72);
  });
  
  test('should handle note collisions', () => {
    const trackIndex = 0;
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0,
      duration: 2,
      velocity: 100
    });
    
    // Add another note on same pitch
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 1,
      duration: 2,
      velocity: 100
    });
    
    const collisions = sequence.findNoteCollisions(trackIndex);
    
    expect(collisions.length).toBe(1);
  });
});