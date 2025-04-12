import { PatternModel, Pattern, MIDINote } from './Pattern';
import {
  createTestPattern,
  createEmptyTestPattern,
  createSelectionTestPattern,
  createPerformanceTestPattern,
  createChordPattern
} from './testFixtures';

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-generated')
}));

describe('PatternModel', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
    // Ensure the mock returns a consistent value
    jest.requireMock('uuid').v4.mockReturnValue('test-uuid-generated');
  });

  describe('createEmptyPattern', () => {
    it('should create a new empty pattern with default settings', () => {
      const pattern = PatternModel.createEmptyPattern();
      
      expect(pattern).toEqual({
        id: 'test-uuid-generated',
        name: 'New Pattern',
        notes: [],
        timeSignature: [4, 4],
        ticksPerBeat: 480,
        length: 7680 // 4 measures * 4 beats * 480 ticks
      });
    });
    
    it('should create a pattern with custom name', () => {
      const pattern = PatternModel.createEmptyPattern('My Custom Pattern');
      
      expect(pattern.name).toBe('My Custom Pattern');
    });
  });
  
  describe('addNote', () => {
    it('should add a note to an empty pattern', () => {
      const emptyPattern = createEmptyTestPattern();
      const newNoteData = {
        pitch: 72,
        startTime: 0,
        duration: 480,
        velocity: 100
      };
      
      const result = PatternModel.addNote(emptyPattern, newNoteData);
      
      expect(result.notes).toHaveLength(1);
      expect(result.notes[0]).toEqual({
        id: 'test-uuid-generated',
        ...newNoteData,
        selected: false
      });
    });
    
    it('should add a note to a pattern with existing notes', () => {
      const pattern = createTestPattern();
      const initialNoteCount = pattern.notes.length;
      const newNoteData = {
        pitch: 72,
        startTime: 0,
        duration: 480,
        velocity: 100
      };
      
      const result = PatternModel.addNote(pattern, newNoteData);
      
      expect(result.notes).toHaveLength(initialNoteCount + 1);
      expect(result.notes).toContainEqual({
        id: 'test-uuid-generated',
        ...newNoteData,
        selected: false
      });
    });
    
    it('should update pattern length when note extends beyond current length', () => {
      const pattern = createTestPattern();
      const originalLength = pattern.length;
      const newNoteData = {
        pitch: 72,
        startTime: originalLength,
        duration: 480,
        velocity: 100
      };
      
      const result = PatternModel.addNote(pattern, newNoteData);
      
      expect(result.length).toBe(originalLength + 480);
    });
    
    it('should not update pattern length when note fits within current length', () => {
      const pattern = createTestPattern();
      const originalLength = pattern.length;
      const newNoteData = {
        pitch: 72,
        startTime: 0,
        duration: 480,
        velocity: 100
      };
      
      const result = PatternModel.addNote(pattern, newNoteData);
      
      expect(result.length).toBe(originalLength);
    });
  });
  
  describe('updateNote', () => {
    it('should update properties of an existing note', () => {
      const pattern = createTestPattern();
      const noteId = pattern.notes[0].id;
      const changes = {
        pitch: 65,
        velocity: 90
      };
      
      const result = PatternModel.updateNote(pattern, noteId, changes);
      
      const updatedNote = result.notes.find(note => note.id === noteId);
      expect(updatedNote).toBeDefined();
      expect(updatedNote?.pitch).toBe(65);
      expect(updatedNote?.velocity).toBe(90);
      expect(updatedNote?.startTime).toBe(pattern.notes[0].startTime); // Unchanged
      expect(updatedNote?.duration).toBe(pattern.notes[0].duration); // Unchanged
    });
    
    it('should not modify other notes', () => {
      const pattern = createTestPattern();
      const noteId = pattern.notes[0].id;
      const changes = {
        pitch: 65,
        velocity: 90
      };
      
      const result = PatternModel.updateNote(pattern, noteId, changes);
      
      // Check other notes are unchanged
      for (let i = 1; i < pattern.notes.length; i++) {
        const originalNote = pattern.notes[i];
        const resultNote = result.notes.find(note => note.id === originalNote.id);
        expect(resultNote).toEqual(originalNote);
      }
    });
    
    it('should update pattern length when note extends beyond current length', () => {
      const pattern = createTestPattern();
      const noteId = pattern.notes[0].id;
      const originalLength = pattern.length;
      const changes = {
        startTime: originalLength,
        duration: 480
      };
      
      const result = PatternModel.updateNote(pattern, noteId, changes);
      
      expect(result.length).toBe(originalLength + 480);
    });
    
    it('should not update pattern length when note fits within current length', () => {
      const pattern = createTestPattern();
      const noteId = pattern.notes[0].id;
      const originalLength = pattern.length;
      const changes = {
        startTime: 0,
        duration: 240
      };
      
      const result = PatternModel.updateNote(pattern, noteId, changes);
      
      expect(result.length).toBe(originalLength);
    });
  });
  
  describe('removeNote', () => {
    it('should remove an existing note', () => {
      const pattern = createTestPattern();
      const noteId = pattern.notes[0].id;
      const initialNoteCount = pattern.notes.length;
      
      const result = PatternModel.removeNote(pattern, noteId);
      
      expect(result.notes).toHaveLength(initialNoteCount - 1);
      expect(result.notes.find(note => note.id === noteId)).toBeUndefined();
    });
    
    it('should recalculate pattern length when removing the last note', () => {
      const pattern = createTestPattern();
      // Last note ends at time 2400
      const lastNoteId = pattern.notes[pattern.notes.length - 1].id;
      
      // In our test pattern, note 3 is at 960 with duration 480, so ends at 1440
      const result = PatternModel.removeNote(pattern, lastNoteId);
      
      // Need to account for minimum measure length (4 beats = 1920)
      expect(result.length).toBe(1920);
    });
    
    it('should not go below minimum length (1 measure)', () => {
      const pattern = createTestPattern();
      // Remove all notes
      let result = pattern;
      for (const note of pattern.notes) {
        result = PatternModel.removeNote(result, note.id);
      }
      
      // Minimum length should be 1 measure (4 beats * 480 ticks)
      expect(result.length).toBe(1920);
    });
  });
  
  describe('selectNotes', () => {
    it('should select specified notes', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id, pattern.notes[2].id];
      
      const result = PatternModel.selectNotes(pattern, noteIds);
      
      expect(result.notes[0].selected).toBe(true);
      expect(result.notes[1].selected).toBe(false);
      expect(result.notes[2].selected).toBe(true);
      expect(result.notes[3].selected).toBe(false);
    });
    
    it('should deselect notes not in the list', () => {
      const pattern = createSelectionTestPattern(); // First two notes are selected
      const noteIds = [pattern.notes[2].id, pattern.notes[3].id]; // Selecting last two notes
      
      const result = PatternModel.selectNotes(pattern, noteIds);
      
      expect(result.notes[0].selected).toBe(false);
      expect(result.notes[1].selected).toBe(false);
      expect(result.notes[2].selected).toBe(true);
      expect(result.notes[3].selected).toBe(true);
    });
  });
  
  describe('clearSelection', () => {
    it('should deselect all notes', () => {
      const pattern = createSelectionTestPattern(); // First two notes are selected
      
      const result = PatternModel.clearSelection(pattern);
      
      for (const note of result.notes) {
        expect(note.selected).toBe(false);
      }
    });
  });
  
  describe('getSelectedNotes', () => {
    it('should return all selected notes', () => {
      const pattern = createSelectionTestPattern(); // First two notes are selected
      
      const result = PatternModel.getSelectedNotes(pattern);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(pattern.notes[0].id);
      expect(result[1].id).toBe(pattern.notes[1].id);
    });
    
    it('should return empty array when no notes are selected', () => {
      const pattern = createTestPattern(); // No notes selected
      
      const result = PatternModel.getSelectedNotes(pattern);
      
      expect(result).toHaveLength(0);
    });
  });
  
  describe('duplicateSelectedNotes', () => {
    it('should duplicate selected notes with new IDs', () => {
      const pattern = createSelectionTestPattern(); // First two notes are selected
      const initialNoteCount = pattern.notes.length;
      
      const result = PatternModel.duplicateSelectedNotes(pattern);
      
      expect(result.notes).toHaveLength(initialNoteCount + 2);
      
      // Check original notes are still there
      for (const originalNote of pattern.notes) {
        expect(result.notes.some(note => note.id === originalNote.id)).toBe(true);
      }
      
      // Check for duplicated notes
      const originalSelected = pattern.notes.filter(note => note.selected);
      for (const original of originalSelected) {
        // Find corresponding duplicated note
        const duplicated = result.notes.find(note => 
          note.id !== original.id && 
          note.pitch === original.pitch &&
          note.startTime === original.startTime &&
          note.duration === original.duration &&
          note.velocity === original.velocity
        );
        
        expect(duplicated).toBeDefined();
        expect(duplicated?.selected).toBe(false); // New notes should not be selected
      }
    });
    
    it('should apply time offset to duplicated notes', () => {
      const pattern = createSelectionTestPattern(); // First two notes are selected
      const offset = 960; // 2 beats
      
      const result = PatternModel.duplicateSelectedNotes(pattern, offset);
      
      // Original notes should be unchanged
      for (let i = 0; i < pattern.notes.length; i++) {
        const originalNote = pattern.notes[i];
        const resultNote = result.notes.find(note => note.id === originalNote.id);
        expect(resultNote).toEqual(originalNote);
      }
      
      // New notes should be offset
      const originalSelected = pattern.notes.filter(note => note.selected);
      for (const original of originalSelected) {
        // Find corresponding duplicated note
        const duplicated = result.notes.find(note => 
          note.id !== original.id && 
          note.pitch === original.pitch &&
          note.startTime === original.startTime + offset &&
          note.duration === original.duration &&
          note.velocity === original.velocity
        );
        
        expect(duplicated).toBeDefined();
      }
    });
    
    it('should update pattern length if needed', () => {
      const pattern = createSelectionTestPattern(); // First two notes are selected
      const originalLength = pattern.length;
      const offset = originalLength; // Offset by pattern length
      
      const result = PatternModel.duplicateSelectedNotes(pattern, offset);
      
      // Find the last ending note
      const duplicatedNotes = result.notes.filter(note => 
        !pattern.notes.some(originalNote => originalNote.id === note.id)
      );
      
      const lastDuplicatedNoteEnd = Math.max(
        ...duplicatedNotes.map(note => note.startTime + note.duration)
      );
      
      expect(result.length).toBe(lastDuplicatedNoteEnd);
      expect(result.length).toBeGreaterThan(originalLength);
    });
    
    it('should do nothing if no notes are selected', () => {
      const pattern = createTestPattern(); // No notes selected
      
      const result = PatternModel.duplicateSelectedNotes(pattern);
      
      expect(result).toEqual(pattern);
    });
  });
  
  describe('quantizeNotes', () => {
    it('should quantize note start times to the grid', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id];
      
      // Move first note off grid slightly
      const modifiedPattern = PatternModel.updateNote(pattern, noteIds[0], {
        startTime: 50 // Slightly off from grid
      });
      
      const gridSize = 120; // 16th note at 480 PPQ
      const result = PatternModel.quantizeNotes(
        modifiedPattern,
        noteIds,
        gridSize,
        true,   // quantize start
        false,  // don't quantize duration
        1.0     // full strength
      );
      
      const quantizedNote = result.notes.find(note => note.id === noteIds[0]);
      expect(quantizedNote?.startTime).toBe(0); // Should snap to closest grid (0)
    });
    
    it('should quantize note durations to the grid when requested', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id];
      
      // Change first note duration to be off grid
      const modifiedPattern = PatternModel.updateNote(pattern, noteIds[0], {
        duration: 500 // Slightly off from grid
      });
      
      const gridSize = 120; // 16th note at 480 PPQ
      const result = PatternModel.quantizeNotes(
        modifiedPattern,
        noteIds,
        gridSize,
        false,  // don't quantize start
        true,   // quantize duration
        1.0     // full strength
      );
      
      const quantizedNote = result.notes.find(note => note.id === noteIds[0]);
      expect(quantizedNote?.duration).toBe(480); // Should snap to closest grid (480 = 4 * 120)
    });
    
    it('should apply partial quantization based on strength parameter', () => {
      // We'll create a completely standalone test for this case
      
      // Mock a simple pattern with a note at an exact off-grid position
      const mockPattern = {
        id: 'test-pattern',
        name: 'Test Pattern',
        notes: [
          {
            id: 'test-note-1',
            pitch: 60,
            startTime: 60, // Exactly 60 ticks off from grid
            duration: 480,
            velocity: 100
          }
        ],
        timeSignature: [4, 4] as [number, number],
        ticksPerBeat: 480,
        length: 480
      };
      
      // Apply a 50% quantization
      const result = PatternModel.quantizeNotes(
        mockPattern,
        ['test-note-1'],
        120, // Grid size of 120 ticks
        true, // Quantize start
        false, // Don't quantize duration
        0.5 // 50% strength exactly
      );
      
      // Find the quantized note
      const quantizedNote = result.notes[0];
      
      // For a note at position 60 with grid size 120:
      // - Nearest grid point is 120 (not 0)
      // - Offset is 120 - 60 = 60
      // - With 50% strength: 60 + (60 * 0.5) = 90
      expect(quantizedNote.startTime).toBe(90);
    });
    
    it('should apply different quantization strengths correctly', () => {
      // Regression test for the quantization algorithm
      // Create test notes at various positions and apply different strengths
      
      const testCases = [
        // [start position, grid size, strength, expected result]
        [30, 120, 0.25, 53], // 25% toward grid point 120
        [30, 120, 0.5, 75],  // 50% toward grid point 120
        [30, 120, 0.75, 98], // 75% toward grid point 120
        [30, 120, 1.0, 120], // 100% (full quantization) to grid point
        [200, 60, 0.5, 215], // 50% toward grid point 240 (nearest multiple of 60)
        [950, 480, 0.8, 970], // 80% toward grid point 960 (nearest beat)
      ];
      
      testCases.forEach(([startPos, gridSize, strength, expected]) => {
        // Create a test pattern with a note at the specified position
        const testPattern = {
          id: 'test-pattern',
          name: 'Regression Test Pattern',
          notes: [
            {
              id: 'test-note',
              pitch: 60,
              startTime: startPos as number,
              duration: 120,
              velocity: 100
            }
          ],
          timeSignature: [4, 4] as [number, number],
          ticksPerBeat: 480,
          length: 480
        };
        
        // Apply quantization with the specified parameters
        const result = PatternModel.quantizeNotes(
          testPattern,
          ['test-note'],
          gridSize as number,
          true,
          false,
          strength as number
        );
        
        // Verify the result matches expected position
        expect(result.notes[0].startTime).toBe(expected);
      });
    });
    
    it('should handle multiple notes', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id, pattern.notes[1].id];
      
      // Move notes off grid
      let modifiedPattern = pattern;
      modifiedPattern = PatternModel.updateNote(modifiedPattern, noteIds[0], {
        startTime: 50
      });
      modifiedPattern = PatternModel.updateNote(modifiedPattern, noteIds[1], {
        startTime: 530
      });
      
      const gridSize = 120;
      const result = PatternModel.quantizeNotes(
        modifiedPattern,
        noteIds,
        gridSize,
        true,
        false,
        1.0
      );
      
      const quantizedNote1 = result.notes.find(note => note.id === noteIds[0]);
      const quantizedNote2 = result.notes.find(note => note.id === noteIds[1]);
      
      expect(quantizedNote1?.startTime).toBe(0);
      expect(quantizedNote2?.startTime).toBe(480);
    });
    
    it('should do nothing with invalid grid size', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id];
      
      // Try with invalid grid size
      const result = PatternModel.quantizeNotes(
        pattern,
        noteIds,
        0, // Invalid grid size
        true,
        false,
        1.0
      );
      
      expect(result).toEqual(pattern);
    });
  });
  
  describe('transposeNotes', () => {
    it('should transpose notes up by the specified number of semitones', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id, pattern.notes[1].id];
      const originalPitches = noteIds.map(id => 
        pattern.notes.find(note => note.id === id)?.pitch
      );
      
      const semitones = 2; // Up a whole tone
      const result = PatternModel.transposeNotes(pattern, noteIds, semitones);
      
      // Check transposed notes
      for (let i = 0; i < noteIds.length; i++) {
        const transposedNote = result.notes.find(note => note.id === noteIds[i]);
        expect(transposedNote?.pitch).toBe(originalPitches[i]! + semitones);
      }
      
      // Check unchanged notes
      const unchangedNotes = pattern.notes.filter(note => !noteIds.includes(note.id));
      for (const original of unchangedNotes) {
        const resultNote = result.notes.find(note => note.id === original.id);
        expect(resultNote?.pitch).toBe(original.pitch);
      }
    });
    
    it('should transpose notes down by the specified number of semitones', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id, pattern.notes[1].id];
      const originalPitches = noteIds.map(id => 
        pattern.notes.find(note => note.id === id)?.pitch
      );
      
      const semitones = -3; // Down a minor third
      const result = PatternModel.transposeNotes(pattern, noteIds, semitones);
      
      // Check transposed notes
      for (let i = 0; i < noteIds.length; i++) {
        const transposedNote = result.notes.find(note => note.id === noteIds[i]);
        expect(transposedNote?.pitch).toBe(originalPitches[i]! + semitones);
      }
    });
    
    it('should clamp pitch values to MIDI range (0-127)', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id]; // C4 (MIDI 60)
      
      // Try to transpose too high
      const highResult = PatternModel.transposeNotes(pattern, noteIds, 70);
      const highNote = highResult.notes.find(note => note.id === noteIds[0]);
      expect(highNote?.pitch).toBe(127); // Clamped to max MIDI pitch
      
      // Try to transpose too low
      const testPattern2 = PatternModel.updateNote(pattern, noteIds[0], { pitch: 5 });
      const lowResult = PatternModel.transposeNotes(testPattern2, noteIds, -10);
      const lowNote = lowResult.notes.find(note => note.id === noteIds[0]);
      expect(lowNote?.pitch).toBe(0); // Clamped to min MIDI pitch
    });
  });
  
  describe('setNotesVelocity and scaleNotesVelocity', () => {
    it('should set the velocity of selected notes', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id, pattern.notes[1].id];
      
      const velocity = 50;
      const result = PatternModel.setNotesVelocity(pattern, noteIds, velocity);
      
      // Check modified notes
      for (const id of noteIds) {
        const modifiedNote = result.notes.find(note => note.id === id);
        expect(modifiedNote?.velocity).toBe(velocity);
      }
      
      // Check unchanged notes
      const unchangedNotes = pattern.notes.filter(note => !noteIds.includes(note.id));
      for (const original of unchangedNotes) {
        const resultNote = result.notes.find(note => note.id === original.id);
        expect(resultNote?.velocity).toBe(original.velocity);
      }
    });
    
    it('should clamp velocity values to MIDI range (1-127)', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id];
      
      // Test with too high velocity
      const highResult = PatternModel.setNotesVelocity(pattern, noteIds, 150);
      const highNote = highResult.notes.find(note => note.id === noteIds[0]);
      expect(highNote?.velocity).toBe(127);
      
      // Test with too low velocity
      const lowResult = PatternModel.setNotesVelocity(pattern, noteIds, 0);
      const lowNote = lowResult.notes.find(note => note.id === noteIds[0]);
      expect(lowNote?.velocity).toBe(1);
    });
    
    it('should scale velocity by percentage', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id]; // Initial velocity 100
      
      // Scale to 50%
      const result = PatternModel.scaleNotesVelocity(pattern, noteIds, 50);
      const scaledNote = result.notes.find(note => note.id === noteIds[0]);
      expect(scaledNote?.velocity).toBe(50); // 100 * 50% = 50
    });
    
    it('should clamp velocity values after scaling', () => {
      const pattern = createTestPattern();
      const noteIds = [pattern.notes[0].id]; // Initial velocity 100
      
      // Scale to 150%
      const highResult = PatternModel.scaleNotesVelocity(pattern, noteIds, 150);
      const highNote = highResult.notes.find(note => note.id === noteIds[0]);
      expect(highNote?.velocity).toBe(127); // Clamped to max
      
      // Scale to 0%
      const lowResult = PatternModel.scaleNotesVelocity(pattern, noteIds, 0);
      const lowNote = lowResult.notes.find(note => note.id === noteIds[0]);
      expect(lowNote?.velocity).toBe(1); // Clamped to min
    });
  });
  
  describe('getNotesInTimeRange', () => {
    it('should return notes starting within the time range', () => {
      const pattern = createTestPattern();
      const startTime = 0;
      const endTime = 960; // First 2 beats
      
      const result = PatternModel.getNotesInTimeRange(pattern, startTime, endTime);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(pattern.notes[0].id);
      expect(result[1].id).toBe(pattern.notes[1].id);
    });
    
    it('should return notes ending within the time range', () => {
      const pattern = createTestPattern();
      const startTime = 960;
      const endTime = 1920; // Beats 2-4
      
      const result = PatternModel.getNotesInTimeRange(pattern, startTime, endTime);
      
      expect(result).toContainEqual(pattern.notes[2]); // Starts at 960, ends at 1440
      expect(result).toContainEqual(pattern.notes[3]); // Starts at 1440, ends at 2400 (extends beyond range)
    });
    
    it('should return notes that completely encompass the time range', () => {
      // Create a pattern with a long note
      const testPattern = createTestPattern();
      const longNotePattern = PatternModel.addNote(testPattern, {
        pitch: 60,
        startTime: 0,
        duration: 1920, // 4 beats long
        velocity: 100
      });
      
      const startTime = 480;
      const endTime = 960; // Beats 1-2
      
      const result = PatternModel.getNotesInTimeRange(longNotePattern, startTime, endTime);
      
      // Should include the long note that encompasses the range
      expect(result.some(note => 
        note.startTime === 0 && note.duration === 1920 && note.pitch === 60
      )).toBe(true);
    });
    
    it('should return empty array if no notes are in range', () => {
      const pattern = createTestPattern();
      const startTime = 3000;
      const endTime = 4000; // Beyond pattern length
      
      const result = PatternModel.getNotesInTimeRange(pattern, startTime, endTime);
      
      expect(result).toHaveLength(0);
    });
  });
  
  describe('ticksToBeat and beatToTicks conversion', () => {
    it('should convert ticks to beats correctly', () => {
      const pattern = createTestPattern(); // 480 PPQ
      
      expect(PatternModel.ticksToBeat(pattern, 0)).toBe(0);
      expect(PatternModel.ticksToBeat(pattern, 480)).toBe(1);
      expect(PatternModel.ticksToBeat(pattern, 960)).toBe(2);
      expect(PatternModel.ticksToBeat(pattern, 240)).toBe(0.5);
    });
    
    it('should convert beats to ticks correctly', () => {
      const pattern = createTestPattern(); // 480 PPQ
      
      expect(PatternModel.beatToTicks(pattern, 0)).toBe(0);
      expect(PatternModel.beatToTicks(pattern, 1)).toBe(480);
      expect(PatternModel.beatToTicks(pattern, 2)).toBe(960);
      expect(PatternModel.beatToTicks(pattern, 0.5)).toBe(240);
    });
    
    it('should round tick values when converting from beats', () => {
      const pattern = createTestPattern(); // 480 PPQ
      
      // 1/3 of a beat is 160 ticks at 480 PPQ, but should be rounded
      expect(PatternModel.beatToTicks(pattern, 1/3)).toBe(160);
    });
  });
  
  // Performance benchmark tests
  describe('Performance', () => {
    it('performance: addNote should handle large patterns efficiently', () => {
      const pattern = createPerformanceTestPattern(5000);
      const start = performance.now();
      const result = PatternModel.addNote(pattern, {
        pitch: 60,
        startTime: 0,
        duration: 480,
        velocity: 100
      });
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should take less than 100ms
      expect(result.notes).toHaveLength(pattern.notes.length + 1);
    });
    
    it('performance: getNotesInTimeRange should be optimized for large patterns', () => {
      const pattern = createPerformanceTestPattern(10000);
      const start = performance.now();
      const result = PatternModel.getNotesInTimeRange(pattern, 0, 960);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should take less than 100ms
    });
    
    it('performance: quantizeNotes should handle bulk operations efficiently', () => {
      const pattern = createPerformanceTestPattern(1000);
      // Select 100 random notes
      const noteIds = pattern.notes.slice(0, 100).map(note => note.id);
      
      const start = performance.now();
      PatternModel.quantizeNotes(pattern, noteIds, 120, true, true, 1.0);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should take less than 100ms
    });
  });
});