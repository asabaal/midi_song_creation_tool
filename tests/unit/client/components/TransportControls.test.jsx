// tests/unit/client/components/TransportControls.test.jsx
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransportControls from '../../../../src/client/components/TransportControls';

// Mock the Transport service
jest.mock('../../../../src/client/services/transportService', () => ({
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setBpm: jest.fn(),
  isPlaying: jest.fn().mockReturnValue(false),
  getCurrentTick: jest.fn().mockReturnValue(0),
  subscribeToTick: jest.fn(),
  unsubscribeFromTick: jest.fn()
}));

// Mock the context provider
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext: jest.fn().mockReturnValue({
    currentSession: {
      id: 'test-session',
      bpm: 120,
      timeSignature: [4, 4]
    },
    updateTransport: jest.fn()
  })
}));

describe('TransportControls', () => {
  // Clean up after each test to prevent multiple instances
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders transport controls', () => {
    render(<TransportControls />);
    
    // Check all main elements are rendered
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
    expect(screen.getByLabelText('Stop')).toBeInTheDocument();
    expect(screen.getByLabelText('Record')).toBeInTheDocument();
    expect(screen.getByLabelText('BPM')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Signature')).toBeInTheDocument();
  });
  
  test('plays and pauses transport', () => {
    const transportService = require('../../../../src/client/services/transportService');
    
    const { rerender } = render(<TransportControls />);
    
    // Click play
    fireEvent.click(screen.getByLabelText('Play'));
    
    expect(transportService.play).toHaveBeenCalled();
    
    // Mock that it's now playing
    transportService.isPlaying.mockReturnValue(true);
    
    // Re-render with same component instance
    rerender(<TransportControls />);
    
    // Now click pause (same button)
    fireEvent.click(screen.getByLabelText('Pause'));
    
    expect(transportService.pause).toHaveBeenCalled();
  });
  
  test('stops transport', () => {
    const transportService = require('../../../../src/client/services/transportService');
    
    render(<TransportControls />);
    
    // Click stop
    fireEvent.click(screen.getByLabelText('Stop'));
    
    expect(transportService.stop).toHaveBeenCalled();
  });
  
  test('updates BPM', () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockUpdateTransport = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      updateTransport: mockUpdateTransport
    });
    
    render(<TransportControls />);
    
    // Find the BPM input
    const bpmInput = screen.getByLabelText('BPM');
    
    // Change BPM value
    fireEvent.change(bpmInput, { target: { value: '140' } });
    fireEvent.blur(bpmInput); // Trigger blur to apply changes
    
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({
      bpm: 140
    }));
  });
  
  test('validates BPM input', () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockUpdateTransport = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      updateTransport: mockUpdateTransport
    });
    
    render(<TransportControls />);
    
    // Find the BPM input
    const bpmInput = screen.getByLabelText('BPM');
    
    // Try to set invalid (too low) BPM
    fireEvent.change(bpmInput, { target: { value: '20' } });
    fireEvent.blur(bpmInput);
    
    // Should clip to minimum value (usually 40)
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({
      bpm: 40 // Assuming 40 is the minimum
    }));
    
    // Reset mock
    mockUpdateTransport.mockClear();
    
    // Try to set invalid (too high) BPM
    fireEvent.change(bpmInput, { target: { value: '300' } });
    fireEvent.blur(bpmInput);
    
    // Should clip to maximum value (usually 240)
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({
      bpm: 240 // Assuming 240 is the maximum
    }));
  });
  
  test('changes time signature', () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockUpdateTransport = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      updateTransport: mockUpdateTransport
    });
    
    render(<TransportControls />);
    
    // Find the time signature select
    const timeSignatureSelect = screen.getByLabelText('Time Signature');
    
    // Change time signature
    fireEvent.change(timeSignatureSelect, { target: { value: '3/4' } });
    
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({
      timeSignature: [3, 4]
    }));
  });
  
  test('toggles recording mode', () => {
    render(<TransportControls />);
    
    // Find the record button
    const recordButton = screen.getByLabelText('Record');
    
    // Click to enable recording
    fireEvent.click(recordButton);
    
    // Record button should now have active class
    expect(recordButton).toHaveClass('active');
    
    // Click again to disable recording
    fireEvent.click(recordButton);
    
    // Record button should not have active class
    expect(recordButton).not.toHaveClass('active');
  });
  
  test('displays current position', () => {
    const transportService = require('../../../../src/client/services/transportService');
    
    // Mock the current position (in ticks)
    transportService.getCurrentTick.mockReturnValue(480); // 1 quarter note at 480 PPQ
    
    const { rerender } = render(<TransportControls />);
    
    // Check that position display is rendered with correct format (e.g., "1.1.00")
    const positionDisplay = screen.getByTestId('position-display');
    expect(positionDisplay).toBeInTheDocument();
    expect(positionDisplay.textContent).toBe('1.1.00');
    
    // Update the tick position
    transportService.getCurrentTick.mockReturnValue(960); // 2 quarter notes
    
    // Re-render the same component instance to update position display
    rerender(<TransportControls />);
    
    // Now check the updated position display
    expect(positionDisplay.textContent).toBe('1.2.00');
  });
  
  test('toggles loop mode', () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockUpdateTransport = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      currentSession: {
        id: 'test-session',
        bpm: 120,
        timeSignature: [4, 4],
        loop: {
          enabled: false,
          start: 0,
          end: 16
        }
      },
      updateTransport: mockUpdateTransport
    });
    
    render(<TransportControls />);
    
    // Find the loop button
    const loopButton = screen.getByLabelText('Loop');
    
    // Click to enable loop
    fireEvent.click(loopButton);
    
    expect(mockUpdateTransport).toHaveBeenCalledWith(expect.objectContaining({
      loop: expect.objectContaining({
        enabled: true
      })
    }));
  });
});