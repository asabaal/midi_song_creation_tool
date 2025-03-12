import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import PatternGenerator from '../../../../src/client/components/PatternGenerator';
import { useSessionContext } from '../../../../src/client/context/SessionContext';
import * as apiService from '../../../../src/client/services/apiService';

// Mock the SessionContext
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext: jest.fn()
}));

// Mock the pattern generator API
jest.mock('../../../../src/client/services/apiService', () => ({
  generatePattern: jest.fn(() => Promise.resolve({ notes: [] }))
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

  afterEach(() => {
    cleanup();
  });

  test('renders pattern generator component', () => {
    render(<PatternGenerator />);

    // Check for the tab buttons in the component
    expect(screen.getByText('Chord Patterns')).toBeInTheDocument();
    expect(screen.getByText('Bassline Patterns')).toBeInTheDocument();
    expect(screen.getByText('Drum Patterns')).toBeInTheDocument();
  });

  test('generates chord pattern', async () => {
    apiService.generatePattern.mockResolvedValue({ notes: [{ id: 'note1', pitch: 60, start: 0, duration: 1 }] });

    render(<PatternGenerator />);

    // Select chord tab (it's usually the default)
    const chordTab = screen.getByText('Chord Patterns');
    fireEvent.click(chordTab);

    // Find the generate button and click it
    const generateButton = screen.getByText('Generate Chord');
    fireEvent.click(generateButton);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalled();
      expect(mockContext.addNotesToTrack).toHaveBeenCalled();
    });
  });

  test('generates bassline pattern', async () => {
    apiService.generatePattern.mockResolvedValue({ notes: [{ id: 'note1', pitch: 48, start: 0, duration: 0.5 }] });

    render(<PatternGenerator />);

    // Select bassline tab
    const basslineTab = screen.getByText('Bassline Patterns');
    fireEvent.click(basslineTab);

    // Find the generate button and click it
    const generateButton = screen.getByText('Generate Bassline');
    fireEvent.click(generateButton);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalled();
      expect(mockContext.addNotesToTrack).toHaveBeenCalled();
    });
  });

  test('generates drum pattern', async () => {
    apiService.generatePattern.mockResolvedValue({ notes: [{ id: 'note1', pitch: 36, start: 0, duration: 0.25 }] });

    render(<PatternGenerator />);

    // Select drum tab
    const drumTab = screen.getByText('Drum Patterns');
    fireEvent.click(drumTab);

    // Find the generate button and click it
    const generateButton = screen.getByText('Generate Drum Pattern');
    fireEvent.click(generateButton);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalled();
      expect(mockContext.addNotesToTrack).toHaveBeenCalled();
    });
  });

  test('changes root note parameter', () => {
    render(<PatternGenerator />);

    // Find root note selector (usually in chord tab)
    const rootSelect = screen.getByLabelText('Root Note');
    fireEvent.change(rootSelect, { target: { value: 'D' } });

    expect(rootSelect.value).toBe('D');
  });

  test('changes chord type parameter', () => {
    render(<PatternGenerator />);

    // Find chord type selector
    const chordTypeSelect = screen.getByLabelText('Chord Type');
    fireEvent.change(chordTypeSelect, { target: { value: 'minor' } });

    expect(chordTypeSelect.value).toBe('minor');
  });

  test('changes bars parameter in drum tab', () => {
    render(<PatternGenerator />);

    // Switch to drum tab
    const drumTab = screen.getByText('Drum Patterns');
    fireEvent.click(drumTab);

    // Find bars input
    const barsInput = screen.getByLabelText('Bars');
    fireEvent.change(barsInput, { target: { value: '2' } });

    expect(barsInput.value).toBe('2');
  });
});