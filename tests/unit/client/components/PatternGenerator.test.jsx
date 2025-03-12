import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatternGenerator from '../../../../src/client/components/PatternGenerator';
import { useSessionContext } from '../../../../src/client/contexts/SessionContext';

// Mock the SessionContext
jest.mock('../../../../src/client/contexts/SessionContext', () => ({
  useSessionContext: jest.fn()
}));

// Mock the pattern generator API
jest.mock('../../../../src/client/services/apiService', () => ({
  generateChordPattern: jest.fn(() => Promise.resolve({ notes: [] })),
  generateBasslinePattern: jest.fn(() => Promise.resolve({ notes: [] })),
  generateDrumPattern: jest.fn(() => Promise.resolve({ notes: [] }))
}));

describe('PatternGenerator', () => {
  // Set up mock context
  const mockContext = {
    currentSession: {
      id: 'test-session-id',
      name: 'Test Session',
      tracks: [
        { id: 'track1', name: 'Test Track', instrument: 'piano', notes: [] }
      ],
      tempo: 120,
      timeSignature: '4/4'
    },
    selectedTrackId: 'track1',
    setSelectedTrackId: jest.fn(),
    addNotesToTrack: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the session context mock
    useSessionContext.mockReturnValue(mockContext);
  });

  test('renders pattern generator component', () => {
    render(<PatternGenerator />);

    // Check for the tab buttons in the component
    expect(screen.getByText(/Chord Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/Basslines/i)).toBeInTheDocument();
    expect(screen.getByText(/Drum Patterns/i)).toBeInTheDocument();
  });

  test('generates chord pattern', async () => {
    const api = require('../../../../src/client/services/apiService');
    api.generateChordPattern.mockResolvedValue({ notes: [{ id: 'note1', pitch: 60, start: 0, duration: 1 }] });

    render(<PatternGenerator />);

    // Select chord tab (it's usually the default)
    const chordTab = screen.getByText(/Chord Patterns/i);
    fireEvent.click(chordTab);

    // Find the generate button and click it
    const generateButton = screen.getByText(/Generate/i);
    fireEvent.click(generateButton);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(api.generateChordPattern).toHaveBeenCalled();
      expect(mockContext.addNotesToTrack).toHaveBeenCalled();
    });
  });

  test('generates bassline pattern', async () => {
    const api = require('../../../../src/client/services/apiService');
    api.generateBasslinePattern.mockResolvedValue({ notes: [{ id: 'note1', pitch: 48, start: 0, duration: 0.5 }] });

    render(<PatternGenerator />);

    // Select bassline tab
    const basslineTab = screen.getByText(/Basslines/i);
    fireEvent.click(basslineTab);

    // Find the generate button and click it
    const generateButton = screen.getByText(/Generate/i);
    fireEvent.click(generateButton);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(api.generateBasslinePattern).toHaveBeenCalled();
      expect(mockContext.addNotesToTrack).toHaveBeenCalled();
    });
  });

  test('generates drum pattern', async () => {
    const api = require('../../../../src/client/services/apiService');
    api.generateDrumPattern.mockResolvedValue({ notes: [{ id: 'note1', pitch: 36, start: 0, duration: 0.25 }] });

    render(<PatternGenerator />);

    // Select drum tab
    const drumTab = screen.getByText(/Drum Patterns/i);
    fireEvent.click(drumTab);

    // Find the generate button and click it
    const generateButton = screen.getByText(/Generate/i);
    fireEvent.click(generateButton);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(api.generateDrumPattern).toHaveBeenCalled();
      expect(mockContext.addNotesToTrack).toHaveBeenCalled();
    });
  });

  test('changes root note parameter', () => {
    render(<PatternGenerator />);

    // Find root note selector (usually in chord tab)
    const rootSelect = screen.getByLabelText(/Root Note/i);
    fireEvent.change(rootSelect, { target: { value: 'D' } });

    expect(rootSelect.value).toBe('D');
  });

  test('changes chord type parameter', () => {
    render(<PatternGenerator />);

    // Find chord type selector
    const chordTypeSelect = screen.getByLabelText(/Chord Type/i);
    fireEvent.change(chordTypeSelect, { target: { value: 'minor' } });

    expect(chordTypeSelect.value).toBe('minor');
  });

  test('changes style parameter in bassline tab', () => {
    render(<PatternGenerator />);

    // Switch to bassline tab
    const basslineTab = screen.getByText(/Basslines/i);
    fireEvent.click(basslineTab);

    // Find style selector
    const styleSelect = screen.getByLabelText(/Style/i);
    fireEvent.change(styleSelect, { target: { value: 'walking' } });

    expect(styleSelect.value).toBe('walking');
  });

  test('changes bars parameter in drum tab', () => {
    render(<PatternGenerator />);

    // Switch to drum tab
    const drumTab = screen.getByText(/Drum Patterns/i);
    fireEvent.click(drumTab);

    // Find bars input
    const barsInput = screen.getByLabelText(/Bars/i);
    fireEvent.change(barsInput, { target: { value: '2' } });

    expect(barsInput.value).toBe('2');
  });

  test('tracks loading state while generating', async () => {
    // Delay the API resolution to observe loading state
    const api = require('../../../../src/client/services/apiService');
    api.generateChordPattern.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ notes: [] });
        }, 100);
      });
    });

    render(<PatternGenerator />);

    // Find and click generate button
    const generateButton = screen.getByText(/Generate/i);
    fireEvent.click(generateButton);

    // Check for loading indicator
    expect(screen.getByText(/Generating.../i)).toBeInTheDocument();

    // Wait for API call to resolve
    await waitFor(() => {
      expect(screen.queryByText(/Generating.../i)).not.toBeInTheDocument();
    });
  });

  test('shows preview when clicking preview button', () => {
    render(<PatternGenerator />);

    // Find preview button
    const previewButton = screen.getByText(/Preview/i);
    fireEvent.click(previewButton);

    // Check if preview action was triggered (this will depend on your implementation)
    // For example, if you have a playback function:
    expect(screen.getByText(/Playing.../i)).toBeInTheDocument();
  });
});