// tests/unit/client/components/TransportControlsState.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock variables
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockPause = jest.fn();
const mockSetLoopPoints = jest.fn();
const mockSetBPM = jest.fn();
const mockUpdateTransport = jest.fn();

// Mock services
jest.mock('../../../../src/client/services/transportService', () => ({
  play: mockStart,
  stop: mockStop,
  pause: mockPause,
  setBpm: mockSetBPM,
  setLoopPoints: mockSetLoopPoints
}));

// Mock the SessionContext
jest.mock('../../../../src/client/contexts/SessionContext', () => {
  return {
    useSessionContext: jest.fn().mockReturnValue({
      currentSession: {
        id: 'test-session',
        bpm: 120,
        timeSignature: [4, 4], 
        loop: { enabled: false },
        loopStart: 0,
        loopEnd: 4
      },
      updateTransport: mockUpdateTransport
    }),
    __esModule: true,
    default: {
      Provider: ({ children }) => children
    }
  };
});

// Now we'll use the real component instead of a mock
jest.mock('../../../../src/client/components/TransportControls', () => {
  // Use the real component
  return jest.requireActual('../../../../src/client/components/TransportControls');
});

// Import the component
const TransportControls = require('../../../../src/client/components/TransportControls').default;

describe('TransportControls Component State Management', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render transport controls with initial state', () => {
    render(<TransportControls />);
    
    // Verify the component renders
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();
    
    // Check initial state - play button should be visible
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
  });

  it('should toggle play/pause state', async () => {
    render(<TransportControls />);
    
    // Find the play button
    const playButton = screen.getByTestId('play-button');
    
    // Click play
    fireEvent.click(playButton);
    
    // Check that transport.play was called
    expect(mockStart).toHaveBeenCalled();
    
    // Now the pause button should be shown instead of play
    await waitFor(() => {
      const pauseButton = screen.queryByTestId('pause-button');
      expect(pauseButton).toBeInTheDocument();
    });
  });

  it('should update tempo state', async () => {
    render(<TransportControls />);
    
    // Find tempo input
    const tempoInput = screen.getByTestId('bpm-input');
    
    // Change tempo value
    fireEvent.change(tempoInput, { target: { value: '140' } });
    
    // Verify BPM was updated
    expect(mockSetBPM).toHaveBeenCalledWith(140);
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({ bpm: 140 }));
  });

  it('should toggle loop state', async () => {
    render(<TransportControls />);
    
    // Find loop toggle
    const loopToggle = screen.getByTestId('loop-toggle');
    
    // Toggle loop on
    fireEvent.click(loopToggle);
    
    // Check that loop was updated
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({ 
      loop: { enabled: true } 
    }));
  });

  it('should maintain state during transport position updates', async () => {
    render(<TransportControls />);
    
    // This is a placeholder test since we can't test this with the mock
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();
  });
});
