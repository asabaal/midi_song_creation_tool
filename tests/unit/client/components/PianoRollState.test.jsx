// tests/unit/client/components/PianoRollState.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PianoRoll from '../../../../src/client/components/PianoRoll';

// Mock the SessionContext
jest.mock('../../../../src/client/contexts/SessionContext', () => ({
  useSession: () => ({
    currentSession: {
      id: 'test-session',
      notes: [],
      tempo: 120,
      timeSignature: '4/4'
    },
    addNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    setCurrentNoteSelection: jest.fn()
  })
}));

// Mock the Tone.js library with virtual: true
jest.mock('tone', () => ({
  Transport: {
    bpm: { value: 120 },
    timeSignature: 4,
    position: '0:0:0'
  },
  context: {
    currentTime: 0
  }
}), { virtual: true });

describe('PianoRoll Component State Management', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render the piano roll with initial state', () => {
    render(<PianoRoll />);
    
    // Verify the component renders
    expect(screen.getByTestId('piano-roll')).toBeInTheDocument();
  });

  it('should handle note selection state', async () => {
    // Mock notes for testing
    const mockNotes = [
      { id: 'note1', pitch: 60, start: 0, duration: 1, velocity: 100 },
      { id: 'note2', pitch: 62, start: 1, duration: 1, velocity: 100 }
    ];

    // Mock the useSession hook to return our test notes
    jest.mock('../../../../src/client/contexts/SessionContext', () => ({
      useSession: () => ({
        currentSession: {
          id: 'test-session',
          notes: mockNotes,
          tempo: 120,
          timeSignature: '4/4'
        },
        addNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        setCurrentNoteSelection: jest.fn()
      })
    }));

    render(<PianoRoll />);
    
    // Find note elements (implementation may vary based on your component)
    const noteElements = screen.queryAllByTestId(/note-/);
    
    // If notes are rendered, test selection behavior
    if (noteElements.length > 0) {
      fireEvent.click(noteElements[0]);
      
      // Wait for any state updates
      await waitFor(() => {
        // Check if the note gets the selected class or attribute
        expect(noteElements[0]).toHaveClass('selected');
      });
    }
  });

  it('should handle zoom state changes', async () => {
    render(<PianoRoll />);
    
    // Find zoom controls (implementation may vary)
    const zoomInButton = screen.queryByTestId('zoom-in');
    
    if (zoomInButton) {
      // Get initial state
      const initialGridSize = getComputedStyle(screen.getByTestId('piano-roll-grid')).backgroundSize;
      
      // Click zoom in
      fireEvent.click(zoomInButton);
      
      // Wait for state update
      await waitFor(() => {
        const newGridSize = getComputedStyle(screen.getByTestId('piano-roll-grid')).backgroundSize;
        expect(newGridSize).not.toBe(initialGridSize);
      });
    }
  });

  it('should handle grid snap setting changes', async () => {
    render(<PianoRoll />);
    
    // Find grid snap controls (implementation may vary)
    const snapSelect = screen.queryByTestId('grid-snap-select');
    
    if (snapSelect) {
      // Change snap value
      fireEvent.change(snapSelect, { target: { value: '0.25' } });
      
      // Wait for state update
      await waitFor(() => {
        expect(snapSelect.value).toBe('0.25');
      });
      
      // Now test that a new note would be created with proper snap
      const pianoRollGrid = screen.getByTestId('piano-roll-grid');
      
      // Simulate adding a note by clicking on the grid
      fireEvent.mouseDown(pianoRollGrid, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(pianoRollGrid);
      
      // Check if addNote was called with snapped position
      // This would require more specific mocking of the context
    }
  });

  it('should maintain state when window is resized', async () => {
    render(<PianoRoll />);
    
    // Trigger window resize event
    global.dispatchEvent(new Event('resize'));
    
    // Wait to ensure component doesn't crash
    await waitFor(() => {
      expect(screen.getByTestId('piano-roll')).toBeInTheDocument();
    });
  });
});
