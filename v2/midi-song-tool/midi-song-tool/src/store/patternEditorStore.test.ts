import { renderHook, act } from '@testing-library/react';
import { usePatternEditorStore } from './patternEditorStore';
import { 
  createTestPattern, 
  createEmptyTestPattern,
  createPerformanceTestPattern
} from '../models/testFixtures';

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-generated')
}));

describe('patternEditorStore', () => {
  // Reset the store and mocks before each test
  beforeEach(() => {
    // Ensure the mock returns a consistent value
    jest.clearAllMocks();
    jest.requireMock('uuid').v4.mockReturnValue('test-uuid-generated');
    
    const { result } = renderHook(() => usePatternEditorStore());
    act(() => {
      // Reset the store to initial state
      result.current.loadPattern(createEmptyTestPattern());
      result.current.clearSelection();
    });
  });
  
  describe('Basic pattern operations', () => {
    it('should create a new pattern', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      
      act(() => {
        result.current.createNewPattern('Test New Pattern');
      });
      
      const pattern = result.current.getCurrentPattern();
      expect(pattern.name).toBe('Test New Pattern');
      expect(pattern.notes).toHaveLength(0);
    });
    
    it('should load an existing pattern', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
      });
      
      const pattern = result.current.getCurrentPattern();
      expect(pattern).toEqual(testPattern);
    });
  });
  
  describe('Note operations', () => {
    it('should add a note', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      
      // Start with empty pattern
      act(() => {
        result.current.loadPattern(createEmptyTestPattern());
      });
      
      act(() => {
        result.current.addNote(60, 0, 480, 100);
      });
      
      const pattern = result.current.getCurrentPattern();
      expect(pattern.notes).toHaveLength(1);
      expect(pattern.notes[0]).toEqual({
        id: 'test-uuid-generated',
        pitch: 60,
        startTime: 0,
        duration: 480,
        velocity: 100,
        selected: false
      });
    });
    
    it('should remove a note', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
      });
      
      const noteToRemove = testPattern.notes[0].id;
      
      act(() => {
        result.current.removeNote(noteToRemove);
      });
      
      const pattern = result.current.getCurrentPattern();
      expect(pattern.notes).toHaveLength(testPattern.notes.length - 1);
      expect(pattern.notes.find(note => note.id === noteToRemove)).toBeUndefined();
    });
    
    it('should update a note', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
      });
      
      const noteToUpdate = testPattern.notes[0].id;
      
      act(() => {
        result.current.updateNote(noteToUpdate, {
          pitch: 65,
          velocity: 90
        });
      });
      
      const pattern = result.current.getCurrentPattern();
      const updatedNote = pattern.notes.find(note => note.id === noteToUpdate);
      expect(updatedNote?.pitch).toBe(65);
      expect(updatedNote?.velocity).toBe(90);
    });
  });
  
  describe('Selection operations', () => {
    it('should select notes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
      });
      
      const notesToSelect = [testPattern.notes[0].id, testPattern.notes[2].id];
      
      act(() => {
        result.current.selectNotes(notesToSelect);
      });
      
      expect(result.current.selection).toEqual(notesToSelect);
    });
    
    it('should select notes in range', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
      });
      
      // Select notes in the first 2 beats within a pitch range
      act(() => {
        result.current.selectNotesInRange(0, 2, 60, 65);
      });
      
      // Should select the first two notes
      expect(result.current.selection).toHaveLength(2);
      expect(result.current.selection).toContain(testPattern.notes[0].id); // C4 (60) at beat 0
      expect(result.current.selection).toContain(testPattern.notes[1].id); // E4 (64) at beat 1
      expect(result.current.selection).not.toContain(testPattern.notes[2].id); // G4 (67) - too high
    });
    
    it('should clear selection', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
        result.current.selectNotes([testPattern.notes[0].id, testPattern.notes[1].id]);
      });
      
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selection).toHaveLength(0);
    });
    
    it('should get selected notes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
        result.current.selectNotes([testPattern.notes[0].id, testPattern.notes[2].id]);
      });
      
      const selectedNotes = result.current.getSelectedNotes();
      
      expect(selectedNotes).toHaveLength(2);
      expect(selectedNotes[0].id).toBe(testPattern.notes[0].id);
      expect(selectedNotes[1].id).toBe(testPattern.notes[2].id);
    });
  });
  
  describe('Edit operations', () => {
    it('should duplicate selected notes', () => {
      // Mock UUID to track duplicates vs original IDs
      let uuidCounter = 0;
      jest.requireMock('uuid').v4.mockImplementation(() => `duplicate-id-${uuidCounter++}`);
      
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
        result.current.selectNotes([testPattern.notes[0].id]);
      });
      
      act(() => {
        result.current.duplicateSelectedNotes(480); // Offset by 1 beat
      });
      
      const pattern = result.current.getCurrentPattern();
      expect(pattern.notes).toHaveLength(testPattern.notes.length + 1);
      
      // Find the duplicated note
      const originalNote = testPattern.notes[0];
      const duplicated = pattern.notes.find(note => 
        note.id !== originalNote.id && 
        note.pitch === originalNote.pitch &&
        note.startTime === originalNote.startTime + 480 &&
        note.duration === originalNote.duration
      );
      
      expect(duplicated).toBeDefined();
    });
    
    it('should quantize selected notes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      const noteId = testPattern.notes[0].id;
      
      // Modify test pattern to have off-grid notes
      const modifiedPattern = { 
        ...testPattern, 
        notes: [...testPattern.notes] 
      };
      modifiedPattern.notes[0] = {
        ...modifiedPattern.notes[0],
        startTime: 50 // Slightly off grid
      };
      
      act(() => {
        result.current.loadPattern(modifiedPattern);
        result.current.selectNotes([noteId]);
      });
      
      act(() => {
        result.current.quantizeSelectedNotes(120); // 16th note grid
      });
      
      const pattern = result.current.getCurrentPattern();
      const quantizedNote = pattern.notes.find(note => note.id === noteId);
      expect(quantizedNote?.startTime).toBe(0); // Should snap to grid
    });
    
    it('should transpose selected notes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      const noteId = testPattern.notes[0].id;
      const originalPitch = testPattern.notes[0].pitch;
      
      act(() => {
        result.current.loadPattern(testPattern);
        result.current.selectNotes([noteId]);
      });
      
      act(() => {
        result.current.transposeSelectedNotes(2); // Up 2 semitones
      });
      
      const pattern = result.current.getCurrentPattern();
      const transposedNote = pattern.notes.find(note => note.id === noteId);
      expect(transposedNote?.pitch).toBe(originalPitch + 2);
    });
    
    it('should set velocity for selected notes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      const noteId = testPattern.notes[0].id;
      
      act(() => {
        result.current.loadPattern(testPattern);
        result.current.selectNotes([noteId]);
      });
      
      act(() => {
        result.current.setSelectedNotesVelocity(80);
      });
      
      const pattern = result.current.getCurrentPattern();
      const updatedNote = pattern.notes.find(note => note.id === noteId);
      expect(updatedNote?.velocity).toBe(80);
    });
  });
  
  describe('View settings', () => {
    it('should set viewport', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      
      act(() => {
        result.current.setViewport(2, 10, 48, 72);
      });
      
      expect(result.current.viewSettings.startBeat).toBe(2);
      expect(result.current.viewSettings.endBeat).toBe(10);
      expect(result.current.viewSettings.lowestNote).toBe(48);
      expect(result.current.viewSettings.highestNote).toBe(72);
    });
    
    it('should set snap to grid', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      
      act(() => {
        result.current.setSnapToGrid(240);
      });
      
      expect(result.current.viewSettings.snapToGrid).toBe(240);
    });
    
    it('should set show velocity', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      
      act(() => {
        result.current.setShowVelocity(false);
      });
      
      expect(result.current.viewSettings.showVelocity).toBe(false);
    });
    
    it('should filter notes in viewport', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const testPattern = createTestPattern();
      
      act(() => {
        result.current.loadPattern(testPattern);
        // Set viewport to only include beats 0-2
        result.current.setViewport(0, 2, 36, 84);
      });
      
      const visibleNotes = result.current.getNotesInViewport();
      
      // Should include only the first two notes
      expect(visibleNotes).toHaveLength(2);
      expect(visibleNotes[0].id).toBe(testPattern.notes[0].id);
      expect(visibleNotes[1].id).toBe(testPattern.notes[1].id);
    });
  });
  
  describe('History operations', () => {
    it('should track changes in history', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const emptyPattern = createEmptyTestPattern();
      
      act(() => {
        result.current.loadPattern(emptyPattern);
      });
      
      // Make changes
      act(() => {
        result.current.addNote(60, 0, 480, 100);
      });
      
      expect(result.current.history.past).toHaveLength(1);
      expect(result.current.history.past[0]).toEqual(emptyPattern);
      expect(result.current.history.future).toHaveLength(0);
    });
    
    it('should undo changes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const emptyPattern = createEmptyTestPattern();
      
      act(() => {
        result.current.loadPattern(emptyPattern);
        result.current.addNote(60, 0, 480, 100);
      });
      
      const patternWithNote = result.current.getCurrentPattern();
      
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.getCurrentPattern()).toEqual(emptyPattern);
      expect(result.current.history.past).toHaveLength(0);
      expect(result.current.history.future).toHaveLength(1);
      expect(result.current.history.future[0]).toEqual(patternWithNote);
    });
    
    it('should redo changes', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const emptyPattern = createEmptyTestPattern();
      
      act(() => {
        result.current.loadPattern(emptyPattern);
        result.current.addNote(60, 0, 480, 100);
        result.current.undo();
      });
      
      act(() => {
        result.current.redo();
      });
      
      const currentPattern = result.current.getCurrentPattern();
      expect(currentPattern.notes).toHaveLength(1);
      expect(currentPattern.notes[0].pitch).toBe(60);
      expect(result.current.history.past).toHaveLength(1);
      expect(result.current.history.future).toHaveLength(0);
    });
    
    it('should clear future history when making a new change after undo', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const emptyPattern = createEmptyTestPattern();
      
      act(() => {
        result.current.loadPattern(emptyPattern);
        result.current.addNote(60, 0, 480, 100); // Add note 1
        result.current.addNote(64, 480, 480, 90); // Add note 2
        result.current.undo(); // Undo note 2
      });
      
      // At this point we have 1 item in past (empty pattern),
      // current pattern has 1 note, and 1 item in future (pattern with 2 notes)
      expect(result.current.history.past).toHaveLength(1);
      expect(result.current.history.future).toHaveLength(1);
      
      // Make a new change
      act(() => {
        result.current.addNote(67, 960, 480, 80); // Add different note
      });
      
      // Future should be cleared, past should have 2 items
      expect(result.current.history.past).toHaveLength(2);
      expect(result.current.history.future).toHaveLength(0);
      
      // Current pattern should have 2 notes
      const currentPattern = result.current.getCurrentPattern();
      expect(currentPattern.notes).toHaveLength(2);
      expect(currentPattern.notes[0].pitch).toBe(60);
      expect(currentPattern.notes[1].pitch).toBe(67);
    });
  });
  
  // Integration tests showing how the store interacts with other components
  describe('Integration with Pattern model', () => {
    it('should correctly apply model operations through store actions', () => {
      // Mock UUID to identify duplicates vs original notes
      let uuidCounter = 0;
      jest.requireMock('uuid').v4.mockImplementation(() => `duplicate-id-${uuidCounter++}`);
      
      const { result } = renderHook(() => usePatternEditorStore());
      const emptyPattern = createEmptyTestPattern();
      
      act(() => {
        result.current.loadPattern(emptyPattern);
        result.current.addNote(60, 0, 480, 100);
        result.current.addNote(64, 480, 480, 90);
      });
      
      // Select and duplicate notes
      act(() => {
        result.current.selectNotes([result.current.getCurrentPattern().notes[0].id]);
        result.current.duplicateSelectedNotes(960); // 2 beats offset
      });
      
      const pattern = result.current.getCurrentPattern();
      expect(pattern.notes).toHaveLength(3);
      
      // Find the duplicated note
      const duplicatedNote = pattern.notes.find(note => 
        note.pitch === 60 && note.startTime === 960
      );
      
      expect(duplicatedNote).toBeDefined();
    });
  });
  
  // Performance tests
  describe('Performance', () => {
    it('performance: should handle large patterns efficiently', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const largePattern = createPerformanceTestPattern(1000);
      
      act(() => {
        result.current.loadPattern(largePattern);
      });
      
      // Measure performance of viewport filtering
      const start = performance.now();
      act(() => {
        result.current.setViewport(0, 4, 48, 72);
      });
      const notesInViewport = result.current.getNotesInViewport();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should take less than 100ms
      expect(notesInViewport.length).toBeLessThan(largePattern.notes.length); // Should filter notes
    });
    
    it('performance: should handle history operations with large patterns', () => {
      const { result } = renderHook(() => usePatternEditorStore());
      const largePattern = createPerformanceTestPattern(1000);
      
      act(() => {
        result.current.loadPattern(largePattern);
        
        // Add a note to generate history
        result.current.addNote(60, 0, 480, 100);
      });
      
      // Measure undo performance
      const start = performance.now();
      act(() => {
        result.current.undo();
      });
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should take less than 100ms
      expect(result.current.getCurrentPattern().notes.length).toBe(largePattern.notes.length);
    });
  });
});