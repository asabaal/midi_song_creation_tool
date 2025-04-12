/**
 * Performance Benchmarks for Pattern Editor
 * 
 * This file contains performance benchmarks for critical operations in the Pattern Editor.
 * These tests are designed to measure performance and detect regressions.
 */

import { PatternModel } from '../models/Pattern';
import { usePatternEditorStore } from '../store/patternEditorStore';
import { 
  createTestPattern, 
  createPerformanceTestPattern 
} from '../models/testFixtures';

// Utility function for timing operations
const benchmark = <T>(name: string, fn: () => T, iterations = 10): T => {
  console.log(`Running benchmark: ${name}`);
  const startTime = performance.now();
  
  let result: T = fn(); // First iteration outside loop to get the result
  
  // Run remaining iterations
  for (let i = 1; i < iterations; i++) {
    fn();
  }
  
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / iterations;
  console.log(`  - Average execution time: ${avgTime.toFixed(2)}ms`);
  return result;
};

describe('Pattern Model Performance', () => {
  test('Adding notes to large patterns', () => {
    // Create patterns with different sizes
    const sizes = [100, 1000, 5000, 10000];
    
    for (const size of sizes) {
      const pattern = createPerformanceTestPattern(size);
      
      const result = benchmark(
        `Adding a note to pattern with ${size} notes`,
        () => PatternModel.addNote(pattern, {
          pitch: 60,
          startTime: 0,
          duration: 480,
          velocity: 100
        }),
        100
      );
      
      // Simple validation
      expect(result.notes).toHaveLength(size + 1);
    }
  });
  
  test('Querying notes in time range', () => {
    // Create patterns with different sizes
    const sizes = [100, 1000, 5000, 10000];
    
    for (const size of sizes) {
      const pattern = createPerformanceTestPattern(size);
      
      // Benchmark getting notes in various time ranges
      const ranges = [
        [0, 480],      // 1 beat
        [0, 1920],     // 4 beats
        [0, 7680],     // 16 beats
      ];
      
      for (const [start, end] of ranges) {
        const result = benchmark(
          `Finding notes in range [${start}-${end}] in pattern with ${size} notes`,
          () => PatternModel.getNotesInTimeRange(pattern, start, end),
          100
        );
        
        // Simple validation
        expect(Array.isArray(result)).toBe(true);
      }
    }
  });
  
  test('Bulk operations on notes', () => {
    // Create a pattern with many notes
    const pattern = createPerformanceTestPattern(5000);
    
    // Select different numbers of notes
    const selectCounts = [10, 100, 1000];
    
    for (const count of selectCounts) {
      // Select the first n notes
      const noteIds = pattern.notes.slice(0, count).map(note => note.id);
      
      // Test quantization
      benchmark(
        `Quantizing ${count} notes`,
        () => PatternModel.quantizeNotes(
          pattern,
          noteIds,
          120,
          true,
          false,
          1.0
        ),
        20
      );
      
      // Test transposition
      benchmark(
        `Transposing ${count} notes`,
        () => PatternModel.transposeNotes(
          pattern,
          noteIds,
          2
        ),
        20
      );
      
      // Test velocity changes
      benchmark(
        `Changing velocity of ${count} notes`,
        () => PatternModel.setNotesVelocity(
          pattern,
          noteIds,
          80
        ),
        20
      );
    }
  });
});

describe('Pattern Editor Store Performance', () => {
  test('Store operations with large patterns', () => {
    // Initialize store
    const store = usePatternEditorStore.getState();
    
    // Test loading different pattern sizes
    const sizes = [100, 1000, 5000];
    
    for (const size of sizes) {
      const pattern = createPerformanceTestPattern(size);
      
      benchmark(
        `Loading pattern with ${size} notes`,
        () => {
          store.loadPattern(pattern);
          return store.getCurrentPattern();
        },
        10
      );
      
      // Test viewport filtering
      benchmark(
        `Filtering viewport with ${size} notes`,
        () => {
          store.setViewport(0, 4, 48, 72);
          return store.getNotesInViewport();
        },
        50
      );
      
      // Test selection operations
      const noteIds = pattern.notes.slice(0, 100).map(note => note.id);
      
      benchmark(
        `Selecting 100 notes in pattern with ${size} notes`,
        () => {
          store.selectNotes(noteIds);
          return store.getSelectedNotes();
        },
        50
      );
      
      // Test editing operations
      benchmark(
        `Adding a note to pattern with ${size} notes`,
        () => {
          store.addNote(60, 0, 480, 100);
          store.undo(); // Revert to keep pattern size consistent
        },
        20
      );
    }
  });
  
  test('History performance with different pattern sizes', () => {
    // Initialize store
    const store = usePatternEditorStore.getState();
    
    // Test undo/redo with different pattern sizes
    const sizes = [100, 1000, 5000];
    
    for (const size of sizes) {
      const pattern = createPerformanceTestPattern(size);
      store.loadPattern(pattern);
      
      // Perform an operation to create history
      store.addNote(60, 0, 480, 100);
      
      // Benchmark undo
      benchmark(
        `Undo operation with ${size} notes`,
        () => {
          store.undo();
          store.redo(); // Restore state for next iteration
        },
        20
      );
      
      // Benchmark redo
      benchmark(
        `Redo operation with ${size} notes`,
        () => {
          store.redo();
          store.undo(); // Restore state for next iteration
        },
        20
      );
    }
  });
});

// This part would run when executed directly (not through Jest)
if (typeof require !== 'undefined' && require.main === module) {
  console.log('Running performance benchmarks manually');
  
  // Simple benchmarks outside Jest
  const pattern = createPerformanceTestPattern(5000);
  
  // Add note benchmark
  const start = performance.now();
  
  for (let i = 0; i < 100; i++) {
    PatternModel.addNote(pattern, {
      pitch: 60,
      startTime: 0,
      duration: 480,
      velocity: 100
    });
  }
  
  const end = performance.now();
  
  console.log(`Manual benchmark - 100 addNote operations: ${(end - start).toFixed(2)}ms total, ${((end - start) / 100).toFixed(2)}ms avg`);
}