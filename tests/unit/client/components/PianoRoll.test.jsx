import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PianoRoll from '../../../../src/client/components/PianoRoll';
import { useSessionContext } from '../../../../src/client/contexts/SessionContext';

// Mock the SessionContext module
jest.mock('../../../../src/client/contexts/SessionContext', () => ({
  useSessionContext: jest.fn()
}));

describe('PianoRoll', () => {
  // Mock session context data
  const mockSessionContext = {
    currentSession: {
      id: 'test-session-id',
      name: 'Test Session',
      tracks: [
        {
          id: 'track1',
          name: 'Test Track', 
          instrument: 'piano',
          notes: [
            { id: 'note1', pitch: 60, start: 0, duration: 1, velocity: 100 }
          ]
        }
      ],
      tempo: 120,
      timeSignature: '4/4'
    },
    selectedTrackId: 'track1',
    setSelectedTrackId: jest.fn(),
    addNoteToTrack: jest.fn(),
    removeNoteFromTrack: jest.fn(),
    updateNoteInTrack: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock return value
    useSessionContext.mockReturnValue(mockSessionContext);
  });

  test('renders piano roll component', () => {
    render(<PianoRoll />);
    // Check for piano roll elements
    expect(screen.getByTestId('piano-roll')).toBeInTheDocument();
  });

  test('displays notes from current track', () => {
    render(<PianoRoll />);
    // This will depend on how you render notes in your component
    // You might need to adjust this test to match your implementation
    const noteElements = screen.getAllByTestId('note-element');
    expect(noteElements.length).toBe(1);
  });

  test('adds a note when clicking on grid', () => {
    const customMockContext = {
      ...mockSessionContext,
      addNoteToTrack: jest.fn()
    };
    
    useSessionContext.mockReturnValue(customMockContext);

    render(<PianoRoll />);
    
    // Find the grid element
    const grid = screen.getByTestId('piano-roll-grid');
    
    // Simulate a click on the grid
    fireEvent.click(grid, { clientX: 100, clientY: 200 });
    
    // Check if addNoteToTrack was called
    expect(customMockContext.addNoteToTrack).toHaveBeenCalled();
  });

  test('selects note when clicking on an existing note', () => {
    render(<PianoRoll />);
    
    // Find a note element
    const noteElement = screen.getByTestId('note-element');
    
    // Simulate a click on the note
    fireEvent.click(noteElement);
    
    // Check if the note is selected (this will depend on your implementation)
    expect(noteElement).toHaveClass('selected');
  });

  test('updates note duration when dragging edge', () => {
    const customMockContext = {
      ...mockSessionContext,
      updateNoteInTrack: jest.fn()
    };
    
    useSessionContext.mockReturnValue(customMockContext);

    render(<PianoRoll />);
    
    // Find a note element
    const noteElement = screen.getByTestId('note-element');
    
    // Find the resize handle
    const resizeHandle = screen.getByTestId('note-resize-handle');
    
    // Simulate dragging the resize handle
    fireEvent.mouseDown(resizeHandle);
    fireEvent.mouseMove(document, { clientX: 150 });
    fireEvent.mouseUp(document);
    
    // Check if updateNoteInTrack was called
    expect(customMockContext.updateNoteInTrack).toHaveBeenCalled();
  });

  test('deletes note when pressing delete key', () => {
    const customMockContext = {
      ...mockSessionContext,
      removeNoteFromTrack: jest.fn()
    };
    
    useSessionContext.mockReturnValue(customMockContext);

    render(<PianoRoll />);
    
    // Find a note element
    const noteElement = screen.getByTestId('note-element');
    
    // Select the note
    fireEvent.click(noteElement);
    
    // Press delete key
    fireEvent.keyDown(document, { key: 'Delete' });
    
    // Check if removeNoteFromTrack was called
    expect(customMockContext.removeNoteFromTrack).toHaveBeenCalled();
  });

  test('changes view when using zoom controls', () => {
    render(<PianoRoll />);
    
    // Find zoom controls
    const zoomInBtn = screen.getByTestId('zoom-in-btn');
    
    // Click zoom in button
    fireEvent.click(zoomInBtn);
    
    // Check for zoomed state (this will depend on your implementation)
    const pianoRoll = screen.getByTestId('piano-roll');
    expect(pianoRoll).toHaveAttribute('data-zoom-level', '2');
  });

  test('allows quantize setting change', () => {
    render(<PianoRoll />);
    
    // Find quantize select
    const quantizeSelect = screen.getByTestId('quantize-select');
    
    // Change quantize value
    fireEvent.change(quantizeSelect, { target: { value: '8' } });
    
    // Check for updated quantize value
    expect(quantizeSelect.value).toBe('8');
  });
});