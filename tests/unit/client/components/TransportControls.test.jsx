import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { act } from 'react';
import TransportControls from '../../../../src/client/components/TransportControls';
import { useSessionContext } from '../../../../src/client/context/SessionContext';
import * as transportService from '../../../../src/client/services/transportService';

// Mock the SessionContext module
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext: jest.fn()
}));

// Mock the transportService module
jest.mock('../../../../src/client/services/transportService', () => ({
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setBpm: jest.fn(),
  isPlaying: jest.fn(),
  subscribeToTick: jest.fn(),
  unsubscribeFromTick: jest.fn()
}));

describe('TransportControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementation for useSessionContext
    useSessionContext.mockReturnValue({
      currentSession: {
        id: 'test-session-id',
        bpm: 120,
        timeSignature: [4, 4],
        loop: { enabled: false }
      },
      updateTransport: jest.fn()
    });
    
    // Setup mock implementation for transportService
    transportService.isPlaying.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup(); // Clean up after each test to prevent duplicate elements
  });

  test('renders transport controls', () => {
    render(<TransportControls />);
    
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    expect(screen.getByTestId('bpm-input')).toBeInTheDocument();
    expect(screen.getByTestId('time-signature-select')).toBeInTheDocument();
  });

  test('plays and pauses transport', () => {
    const { rerender } = render(<TransportControls />);
    
    const playButton = screen.getByTestId('play-button');
    
    // Play
    fireEvent.click(playButton);
    expect(transportService.play).toHaveBeenCalled();
    
    // Change isPlaying to true for pause test
    transportService.isPlaying.mockReturnValue(true);
    
    // Re-render to reflect the changed state
    rerender(<TransportControls />);
    
    // Check button label has changed to pause
    expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    
    // Pause
    fireEvent.click(screen.getByLabelText('Pause'));
    expect(transportService.pause).toHaveBeenCalled();
  });

  test('stops transport', () => {
    render(<TransportControls />);
    
    const stopButton = screen.getByTestId('stop-button');
    
    fireEvent.click(stopButton);
    expect(transportService.stop).toHaveBeenCalled();
  });

  test('updates BPM', () => {
    const updateTransportMock = jest.fn();
    useSessionContext.mockReturnValue({
      currentSession: {
        id: 'test-session-id',
        bpm: 120,
        timeSignature: [4, 4]
      },
      updateTransport: updateTransportMock
    });
    
    render(<TransportControls />);
    
    const bpmInput = screen.getByTestId('bpm-input');
    
    fireEvent.change(bpmInput, { target: { value: '140' } });
    fireEvent.blur(bpmInput);
    
    expect(transportService.setBpm).toHaveBeenCalledWith(140);
    expect(updateTransportMock).toHaveBeenCalledWith({ bpm: 140 });
  });

  test('validates BPM input', () => {
    render(<TransportControls />);
    
    const bpmInput = screen.getByTestId('bpm-input');
    
    // Try too low
    fireEvent.change(bpmInput, { target: { value: '10' } });
    fireEvent.blur(bpmInput);
    
    // Should set to minimum allowed value
    expect(transportService.setBpm).toHaveBeenCalledWith(40);
    
    // Try too high
    fireEvent.change(bpmInput, { target: { value: '300' } });
    fireEvent.blur(bpmInput);
    
    // Should set to maximum allowed value
    expect(transportService.setBpm).toHaveBeenCalledWith(240);
  });

  test('changes time signature', () => {
    const updateTransportMock = jest.fn();
    useSessionContext.mockReturnValue({
      currentSession: {
        id: 'test-session-id',
        bpm: 120,
        timeSignature: [4, 4]
      },
      updateTransport: updateTransportMock
    });
    
    render(<TransportControls />);
    
    const timeSignatureSelect = screen.getByTestId('time-signature-select');
    
    fireEvent.change(timeSignatureSelect, { target: { value: '3/4' } });
    
    expect(updateTransportMock).toHaveBeenCalledWith({ timeSignature: [3, 4] });
  });

  test('toggles recording mode', () => {
    const { rerender } = render(<TransportControls />);
    
    // Find the record button by both testId and aria-label
    const recordButton = screen.getByLabelText('Record');
    expect(recordButton).not.toHaveClass('active');
    
    // Toggle recording on
    fireEvent.click(recordButton);
    
    // Clean up and rerender to simulate state update
    cleanup();
    rerender(<TransportControls />);
  });

  test('displays current position', () => {
    // Create a function to capture the tick callback
    let tickCallback;
    transportService.subscribeToTick.mockImplementation((callback) => {
      tickCallback = callback;
    });
    
    const { rerender } = render(<TransportControls />);
    
    // Initial position display check
    const initialPositionDisplay = screen.getByTestId('position-display');
    expect(initialPositionDisplay).toBeInTheDocument();
    
    // Simulate a tick update
    act(() => {
      // Call the tick callback with a mock position
      tickCallback(960); // This should be 1 quarter note at 480 ppq
    });
    
    // Rerender to see updates
    cleanup();
    rerender(<TransportControls />);
  });
});