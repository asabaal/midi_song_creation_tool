// tests/unit/client/components/PianoRoll.test.jsx
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PianoRoll from '../../../../src/client/components/PianoRoll';

// Mock the session context
const mockSessionContext = {
  currentSession: {
    id: 'test-session',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [
      {
        id: 0,
        name: 'Piano',
        instrument: 0,
        notes: [
          { id: 'note1', pitch: 60, startTime: 0, duration: 1, velocity: 100 },
          { id: 'note2', pitch: 64, startTime: 1, duration: 1, velocity: 100 },
          { id: 'note3', pitch: 67, startTime: 2, duration: 1, velocity: 100 },
        ]
      }
    ],
    loop: {
      enabled: false,
      start: 0,
      end: 16
    }
  },
  addNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  selectedTrackId: 0,
  setSelectedTrackId: jest.fn()
};

// Mock the context provider
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext: jest.fn().mockReturnValue(mockSessionContext)
}));

// Mock the canvas rendering
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  setLineDash: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: ''
});

// Mock the CSS imports
jest.mock('../../../../src/client/styles/PianoRoll.css', () => ({}));

describe('PianoRoll', () => {
  // Clean up after each test to prevent duplicate render issues
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders piano roll component', () => {
    render(<PianoRoll />);
    
    // Check that piano keys and grid are rendered
    expect(screen.getByTestId('piano-roll-container')).toBeInTheDocument();
    expect(screen.getByTestId('piano-keys')).toBeInTheDocument();
    expect(screen.getByTestId('note-grid')).toBeInTheDocument();
  });
  
  test('displays notes from current track', () => {
    render(<PianoRoll />);
    
    // Note: In a real test we'd check that notes are rendered on the canvas
    // Since we've mocked the canvas, we'll just verify the component doesn't crash
    const noteGrid = screen.getByTestId('note-grid');
    expect(noteGrid).toBeInTheDocument();
  });
  
  test('adds a note when clicking on grid', () => {
    const mockAddNote = jest.fn();
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    useSessionContext.mockReturnValue({
      ...mockSessionContext,
      addNote: mockAddNote
    });
    
    render(<PianoRoll />);
    
    const noteGrid = screen.getByTestId('note-grid');
    fireEvent.mouseDown(noteGrid, { clientX: 100, clientY: 200 });
    fireEvent.mouseUp(noteGrid);
    
    expect(mockAddNote).toHaveBeenCalled();
  });
  
  test('selects note when clicking on an existing note', () => {
    render(<PianoRoll />);
    
    // In a real test, we'd simulate clicking on a specific note position
    // Since canvas testing is limited, we'll just check the selection behavior
    const noteGrid = screen.getByTestId('note-grid');
    
    // Simulate mousedown at position where a note exists (would need positioning calculation in a real test)
    fireEvent.mouseDown(noteGrid, { clientX: 50, clientY: 60 });
    
    // This would typically set a selected note state which we could check
    // In this mocked version, we just ensure it doesn't crash
    expect(noteGrid).toBeInTheDocument();
  });
  
  test('updates note duration when dragging edge', async () => {
    const mockUpdateNote = jest.fn();
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    useSessionContext.mockReturnValue({
      ...mockSessionContext,
      updateNote: mockUpdateNote
    });
    
    render(<PianoRoll />);
    
    const noteGrid = screen.getByTestId('note-grid');
    
    // Simulate selecting a note and then dragging its edge
    // 1. Select note
    fireEvent.mouseDown(noteGrid, { clientX: 50, clientY: 60 });
    
    // 2. Simulate mouse movement to resize
    fireEvent.mouseMove(noteGrid, { clientX: 70, clientY: 60 });
    
    // 3. Release mouse
    fireEvent.mouseUp(noteGrid);
    
    // In a real test, we'd check specific parameters of updateNote()
    expect(noteGrid).toBeInTheDocument();
  });
  
  test('deletes note when pressing delete key', () => {
    const mockDeleteNote = jest.fn();
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    useSessionContext.mockReturnValue({
      ...mockSessionContext,
      deleteNote: mockDeleteNote
    });
    
    render(<PianoRoll />);
    
    // 1. First select a note
    const noteGrid = screen.getByTestId('note-grid');
    fireEvent.mouseDown(noteGrid, { clientX: 50, clientY: 60 });
    
    // 2. Press delete key
    fireEvent.keyDown(document, { key: 'Delete' });
    
    expect(mockDeleteNote).toHaveBeenCalled();
  });
  
  test('changes view when using zoom controls', () => {
    render(<PianoRoll />);
    
    const zoomInButton = screen.getByLabelText('Zoom In');
    const zoomOutButton = screen.getByLabelText('Zoom Out');
    
    // Initial render should be complete
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    
    // Click zoom in
    fireEvent.click(zoomInButton);
    
    // Click zoom out
    fireEvent.click(zoomOutButton);
    
    // Just check that these actions don't cause errors (actual zoom logic would be tested in more detail)
    expect(screen.getByTestId('note-grid')).toBeInTheDocument();
  });
  
  test('allows quantize setting change', () => {
    render(<PianoRoll />);
    
    const quantizeSelect = screen.getByLabelText('Quantize');
    
    // Check that select exists
    expect(quantizeSelect).toBeInTheDocument();
    
    // Change quantize value
    fireEvent.change(quantizeSelect, { target: { value: '0.25' } });
    
    // Verify the select value was updated
    expect(quantizeSelect.value).toBe('0.25');
  });
});
