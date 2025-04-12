/**
 * Test fixtures for Pattern model tests
 * 
 * This module provides mock data for testing the Pattern model and editor.
 * 
 * @module testFixtures
 */

import { Pattern, MIDINote } from './Pattern';

/**
 * Creates a mock MIDI note with the specified properties
 * 
 * @param id - Unique identifier for the note
 * @param pitch - MIDI pitch value (default: 60 / C4)
 * @param startTime - Start time in ticks (default: 0)
 * @param duration - Duration in ticks (default: 480 / quarter note)
 * @param velocity - MIDI velocity (default: 100)
 * @param selected - Whether the note is selected (default: false)
 * @returns A MIDINote object
 */
export const createMockNote = (
  id: string,
  pitch: number = 60,
  startTime: number = 0,
  duration: number = 480,
  velocity: number = 100,
  selected: boolean = false
): MIDINote => ({
  id,
  pitch,
  startTime,
  duration,
  velocity,
  selected,
});

/**
 * Creates a test pattern with a C major triad progression
 * 
 * @returns A Pattern with 4 notes (C-E-G-C)
 */
export const createTestPattern = (): Pattern => ({
  id: 'test-pattern-id',
  name: 'Test Pattern',
  notes: [
    createMockNote('note-1', 60, 0, 480, 100),       // C4, beat 0, quarter note
    createMockNote('note-2', 64, 480, 480, 90),      // E4, beat 1, quarter note
    createMockNote('note-3', 67, 960, 480, 80),      // G4, beat 2, quarter note
    createMockNote('note-4', 72, 1440, 960, 100),    // C5, beat 3, half note
  ],
  timeSignature: [4, 4],
  ticksPerBeat: 480,
  length: 2400 // 5 beats
});

/**
 * Creates an empty test pattern
 * 
 * @returns An empty Pattern
 */
export const createEmptyTestPattern = (): Pattern => ({
  id: 'empty-pattern-id',
  name: 'Empty Test Pattern',
  notes: [],
  timeSignature: [4, 4],
  ticksPerBeat: 480,
  length: 1920 // 4 beats
});

/**
 * Creates a complex test pattern with many random notes
 * 
 * @returns A Pattern with 100 random notes
 */
export const createComplexTestPattern = (): Pattern => {
  const notes: MIDINote[] = [];
  const totalNotes = 100;
  const patternLength = 16 * 480; // 16 beats
  
  // Seed to ensure deterministic output for tests
  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  const random = seededRandom(12345);
  
  // Create 100 random notes
  for (let i = 0; i < totalNotes; i++) {
    const id = `complex-note-${i}`;
    const pitch = Math.floor(random() * 48) + 36; // Range: C2-C6
    const startTime = Math.floor(random() * patternLength);
    const duration = Math.floor(random() * 960) + 120; // 1/16th note to half note
    const velocity = Math.floor(random() * 60) + 40; // 40-100
    
    notes.push(createMockNote(id, pitch, startTime, duration, velocity));
  }
  
  return {
    id: 'complex-pattern-id',
    name: 'Complex Test Pattern',
    notes,
    timeSignature: [4, 4],
    ticksPerBeat: 480,
    length: patternLength
  };
};

/**
 * Creates a pattern with chord progression (C-F-G-C)
 * 
 * @returns A Pattern with 12 notes (4 chords of 3 notes each)
 */
export const createChordPattern = (): Pattern => ({
  id: 'chord-pattern-id',
  name: 'Chord Test Pattern',
  notes: [
    // C major chord on beat 0
    createMockNote('chord1-1', 60, 0, 480, 100),  // C4
    createMockNote('chord1-2', 64, 0, 480, 100),  // E4
    createMockNote('chord1-3', 67, 0, 480, 100),  // G4
    
    // F major chord on beat 1
    createMockNote('chord2-1', 65, 480, 480, 90),  // F4
    createMockNote('chord2-2', 69, 480, 480, 90),  // A4
    createMockNote('chord2-3', 72, 480, 480, 90),  // C5
    
    // G major chord on beat 2
    createMockNote('chord3-1', 67, 960, 480, 80),  // G4
    createMockNote('chord3-2', 71, 960, 480, 80),  // B4
    createMockNote('chord3-3', 74, 960, 480, 80),  // D5
    
    // C major chord on beat 3
    createMockNote('chord4-1', 60, 1440, 480, 100),  // C4
    createMockNote('chord4-2', 64, 1440, 480, 100),  // E4
    createMockNote('chord4-3', 67, 1440, 480, 100),  // G4
  ],
  timeSignature: [4, 4],
  ticksPerBeat: 480,
  length: 1920 // 4 beats
});

/**
 * Creates a test pattern with some notes already selected
 * 
 * @returns A Pattern with the first two notes selected
 */
export const createSelectionTestPattern = (): Pattern => {
  const pattern = createTestPattern();
  return {
    ...pattern,
    notes: pattern.notes.map((note, index) => ({
      ...note,
      selected: index < 2 // First two notes selected
    }))
  };
};

/**
 * Creates a large pattern for performance testing
 * 
 * @param noteCount - Number of notes to create (default: 1000)
 * @returns A Pattern with the specified number of notes
 */
export const createPerformanceTestPattern = (noteCount: number = 1000): Pattern => {
  const notes: MIDINote[] = [];
  const patternLength = 16 * 480; // 16 beats
  
  // Seed to ensure deterministic output for tests
  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  const random = seededRandom(54321);
  
  for (let i = 0; i < noteCount; i++) {
    const id = `perf-note-${i}`;
    const pitch = Math.floor(random() * 48) + 36; // Range: C2-C6
    const startTime = Math.floor(random() * patternLength);
    const duration = Math.floor(random() * 960) + 120; // 1/16th note to half note
    const velocity = Math.floor(random() * 60) + 40; // 40-100
    
    notes.push(createMockNote(id, pitch, startTime, duration, velocity));
  }
  
  return {
    id: 'performance-pattern-id',
    name: 'Performance Test Pattern',
    notes,
    timeSignature: [4, 4],
    ticksPerBeat: 480,
    length: patternLength
  };
};