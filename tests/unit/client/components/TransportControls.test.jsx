import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransportControls from '../../../../src/client/components/TransportControls';
import { act } from 'react-dom/test-utils';

// Mock the SessionContext module
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext: jest.fn(() => ({
    currentSession: {
      id: 'test-session-id',
      tempo: 120,
      timeSignature: '4/4'
    },
    updateSession: jest.fn()
  }))
}));

// Mock Tone.js
jest.mock('tone', () => {
  return {
    Transport: {
      start: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      bpm: {
        value: 120,
        set: jest.fn()
      },
      timeSignature: 4,
      position: '0:0:0',
      setLoopPoints: jest.fn(),
      loop: false
    },
    start: jest.fn()
  };
});

describe('TransportControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders transport controls', () => {
    render(<TransportControls />);
    
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    expect(screen.getByTestId('bpm-input')).toBeInTheDocument();
    expect(screen.getByTestId('time-signature-select')).toBeInTheDocument();
  });

  test('plays and pauses transport', () => {
    render(<TransportControls />);
    
    const playButton = screen.getByTestId('play-button');
    
    // Play
    fireEvent.click(playButton);
    expect(require('tone').Transport.start).toHaveBeenCalled();
    
    // Mock the state change that would happen in the component
    act(() => {
      // Manually update button text to simulate state change
      playButton.textContent = 'Pause';
    });
    
    // Pause
    fireEvent.click(playButton);
    expect(require('tone').Transport.pause).toHaveBeenCalled();
  });

  test('stops transport', () => {
    render(<TransportControls />);
    
    const stopButton = screen.getByTestId('stop-button');
    
    fireEvent.click(stopButton);
    expect(require('tone').Transport.stop).toHaveBeenCalled();
  });

  test('updates BPM', () => {
    render(<TransportControls />);
    
    const bpmInput = screen.getByTestId('bpm-input');
    
    fireEvent.change(bpmInput, { target: { value: '140' } });
    fireEvent.blur(bpmInput);
    
    expect(require('tone').Transport.bpm.set).toHaveBeenCalledWith(140);
  });

  test('validates BPM input', () => {
    render(<TransportControls />);
    
    const bpmInput = screen.getByTestId('bpm-input');
    
    // Try too low
    fireEvent.change(bpmInput, { target: { value: '10' } });
    fireEvent.blur(bpmInput);
    
    // Should set to minimum allowed value
    expect(require('tone').Transport.bpm.set).toHaveBeenCalledWith(40);
    
    // Try too high
    fireEvent.change(bpmInput, { target: { value: '300' } });
    fireEvent.blur(bpmInput);
    
    // Should set to maximum allowed value
    expect(require('tone').Transport.bpm.set).toHaveBeenCalledWith(240);
  });

  test('changes time signature', () => {
    render(<TransportControls />);
    
    const timeSignatureSelect = screen.getByTestId('time-signature-select');
    
    fireEvent.change(timeSignatureSelect, { target: { value: '3/4' } });
    
    // Assuming your component updates Transport.timeSignature
    expect(require('tone').Transport.timeSignature).toBe(3);
  });

  test('toggles recording mode', () => {
    render(<TransportControls />);
    
    const recordButton = screen.getByTestId('record-button');
    
    fireEvent.click(recordButton);
    
    // Check if record button is active
    expect(recordButton).toHaveClass('active');
  });

  test('displays current position', () => {
    render(<TransportControls />);
    
    // Initial position display
    const initialDisplays = screen.getAllByTestId('position-display');
    expect(initialDisplays).toHaveLength(1);
    
    // Mock Tone.Transport position update
    const Tone = require('tone');
    Tone.Transport.position = '1:1:0';
    
    // Trigger an update
    act(() => {
      // Simulate a position update
      const event = new CustomEvent('position', { detail: '1:1:0' });
      document.dispatchEvent(event);
    });
    
    // Check updated display
    const updatedDisplays = screen.getAllByTestId('position-display');
    expect(updatedDisplays).toHaveLength(1);
    expect(updatedDisplays[0].textContent).toBe('1.1.00');
  });

  test('toggles loop mode', () => {
    render(<TransportControls />);
    
    const loopButton = screen.getByTestId('loop-button');
    
    fireEvent.click(loopButton);
    
    // Check if loop was enabled
    expect(require('tone').Transport.loop).toBe(true);
  });
});