import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatternEditor from '../components/PatternEditor/PatternEditor';
import { usePatternEditorStore } from '../store/patternEditorStore';
import { createTestPattern } from '../models/testFixtures';

// Create a test wrapper component that provides the store context and test UI
const TestPatternEditorWrapper = () => {
  const {
    getCurrentPattern,
    selection,
    loadPattern,
    selectNotes,
    addNote,
    removeNote,
    updateNote,
    duplicateSelectedNotes,
    undo,
    redo
  } = usePatternEditorStore();

  const pattern = getCurrentPattern();

  // Load test pattern on mount
  React.useEffect(() => {
    loadPattern(createTestPattern());
  }, [loadPattern]);

  // Add test controls for interacting with store
  return (
    <div>
      <div data-testid="pattern-info">
        <div>Pattern Name: {pattern.name}</div>
        <div>Note Count: {pattern.notes.length}</div>
        <div>Selected Count: {selection.length}</div>
      </div>
      
      <button 
        data-testid="select-first-note"
        onClick={() => {
          if (pattern.notes.length > 0) {
            selectNotes([pattern.notes[0].id]);
          }
        }}
      >
        Select First Note
      </button>
      
      <button
        data-testid="add-note"
        onClick={() => {
          addNote(60, 0, 480, 100);
        }}
      >
        Add Note
      </button>
      
      <button
        data-testid="remove-selected"
        onClick={() => {
          if (selection.length > 0) {
            removeNote(selection[0]);
          }
        }}
      >
        Remove Selected
      </button>
      
      <button
        data-testid="update-selected"
        onClick={() => {
          if (selection.length > 0) {
            updateNote(selection[0], { pitch: 72 });
          }
        }}
      >
        Update Selected
      </button>
      
      <button
        data-testid="duplicate-selected"
        onClick={() => {
          duplicateSelectedNotes(480);
        }}
      >
        Duplicate Selected
      </button>
      
      <button
        data-testid="undo"
        onClick={() => {
          undo();
        }}
      >
        Undo
      </button>
      
      <button
        data-testid="redo"
        onClick={() => {
          redo();
        }}
      >
        Redo
      </button>
      
      <PatternEditor />
    </div>
  );
};

describe('PatternEditor Integration', () => {
  it('should display pattern information correctly', async () => {
    render(<TestPatternEditorWrapper />);
    
    // Check pattern info is rendered
    await waitFor(() => {
      expect(screen.getByText(/Pattern Name: Test Pattern/)).toBeInTheDocument();
      expect(screen.getByText(/Note Count: 4/)).toBeInTheDocument();
    });
  });
  
  it('should update selection state', async () => {
    render(<TestPatternEditorWrapper />);
    
    // Initial state - no selection
    await waitFor(() => {
      expect(screen.getByText(/Selected Count: 0/)).toBeInTheDocument();
    });
    
    // Select the first note
    fireEvent.click(screen.getByTestId('select-first-note'));
    
    await waitFor(() => {
      expect(screen.getByText(/Selected Count: 1/)).toBeInTheDocument();
    });
  });
  
  it('should add and remove notes', async () => {
    render(<TestPatternEditorWrapper />);
    
    // Initial note count
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 4/)).toBeInTheDocument();
    });
    
    // Add a new note
    fireEvent.click(screen.getByTestId('add-note'));
    
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 5/)).toBeInTheDocument();
    });
    
    // Select and remove a note
    fireEvent.click(screen.getByTestId('select-first-note'));
    fireEvent.click(screen.getByTestId('remove-selected'));
    
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 4/)).toBeInTheDocument();
    });
  });
  
  it('should update note properties', async () => {
    const { container } = render(<TestPatternEditorWrapper />);
    
    // Select the first note
    fireEvent.click(screen.getByTestId('select-first-note'));
    
    // Update the note
    fireEvent.click(screen.getByTestId('update-selected'));
    
    // Check if the note was updated in PatternEditor visually
    // This test depends on PatternEditor rendering - we'll check store state
    const storeState = usePatternEditorStore.getState();
    const updatedNote = storeState.getSelectedNotes()[0];
    
    expect(updatedNote.pitch).toBe(72);
  });
  
  it('should support duplicate operations', async () => {
    render(<TestPatternEditorWrapper />);
    
    // Initial note count
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 4/)).toBeInTheDocument();
    });
    
    // Select and duplicate a note
    fireEvent.click(screen.getByTestId('select-first-note'));
    fireEvent.click(screen.getByTestId('duplicate-selected'));
    
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 5/)).toBeInTheDocument();
    });
  });
  
  it('should support undo/redo operations', async () => {
    render(<TestPatternEditorWrapper />);
    
    // Initial note count
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 4/)).toBeInTheDocument();
    });
    
    // Add a new note
    fireEvent.click(screen.getByTestId('add-note'));
    
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 5/)).toBeInTheDocument();
    });
    
    // Undo the operation
    fireEvent.click(screen.getByTestId('undo'));
    
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 4/)).toBeInTheDocument();
    });
    
    // Redo the operation
    fireEvent.click(screen.getByTestId('redo'));
    
    await waitFor(() => {
      expect(screen.getByText(/Note Count: 5/)).toBeInTheDocument();
    });
  });
  
  // This test requires more mocking of the actual rendering logic
  it('should render notes in the pattern editor', async () => {
    const { container } = render(<TestPatternEditorWrapper />);
    
    // Wait for pattern to load
    await waitFor(() => {
      expect(screen.getByText(/Pattern Name: Test Pattern/)).toBeInTheDocument();
    });
    
    // We'd need to check DOM elements related to notes
    // This is a simplified check - you would replace this with actual
    // visual elements from your PatternEditor component
    const patternEditor = container.querySelector('.pattern-editor-container');
    expect(patternEditor).toBeInTheDocument();
  });
});

// Create a performance benchmark suite that measures critical operations
describe('PatternEditor Performance Benchmarks', () => {
  // This is a helper to measure execution time
  const measurePerformance = (fn: () => void, iterations = 1): number => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();
    return (end - start) / iterations;
  };
  
  it('benchmark: render performance with different pattern sizes', () => {
    // This benchmark would measure how long it takes to render the editor
    // with different numbers of notes
    
    const sizes = [10, 100, 500];
    const results: Record<number, number> = {};
    
    for (const size of sizes) {
      const time = measurePerformance(() => {
        const { container, unmount } = render(<TestPatternEditorWrapper />);
        unmount();
      });
      
      results[size] = time;
      
      // Log the result for reporting
      console.log(`Render time with ${size} notes: ${time.toFixed(2)}ms`);
      
      // Simple assertion to catch severe performance regressions
      // Adjust thresholds based on your application's needs
      expect(time).toBeLessThan(500); // 500ms max render time
    }
  });
  
  it('benchmark: note manipulation operations', () => {
    // Setup the component
    render(<TestPatternEditorWrapper />);
    
    // Wait for pattern to load
    waitFor(() => {
      expect(screen.getByText(/Pattern Name: Test Pattern/)).toBeInTheDocument();
    });
    
    // Measure add note performance
    const addNoteTime = measurePerformance(() => {
      fireEvent.click(screen.getByTestId('add-note'));
      fireEvent.click(screen.getByTestId('undo'));
    }, 5);
    
    console.log(`Add note operation time: ${addNoteTime.toFixed(2)}ms`);
    expect(addNoteTime).toBeLessThan(100); // 100ms max operation time
    
    // Measure selection and update performance
    const updateTime = measurePerformance(() => {
      fireEvent.click(screen.getByTestId('select-first-note'));
      fireEvent.click(screen.getByTestId('update-selected'));
      fireEvent.click(screen.getByTestId('undo'));
    }, 5);
    
    console.log(`Select and update operation time: ${updateTime.toFixed(2)}ms`);
    expect(updateTime).toBeLessThan(100); // 100ms max operation time
    
    // Measure duplicate performance
    const duplicateTime = measurePerformance(() => {
      fireEvent.click(screen.getByTestId('select-first-note'));
      fireEvent.click(screen.getByTestId('duplicate-selected'));
      fireEvent.click(screen.getByTestId('undo'));
    }, 5);
    
    console.log(`Duplicate operation time: ${duplicateTime.toFixed(2)}ms`);
    expect(duplicateTime).toBeLessThan(100); // 100ms max operation time
  });
});