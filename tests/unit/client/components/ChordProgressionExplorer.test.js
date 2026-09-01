/**
 * Tests for ChordProgressionExplorer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChordProgressionExplorer from '../../../../src/client/components/ChordProgressionExplorer/ChordProgressionExplorer';

// Mock the chord progression service
jest.mock('../../../../src/client/services/chordProgressionService', () => ({
  getKeys: jest.fn(() => Promise.resolve({
    major: ['C major', 'G major', 'D major'],
    minor: ['A minor', 'E minor', 'B minor'],
    all: ['C major', 'G major', 'D major', 'A minor', 'E minor', 'B minor'],
    total: 6
  })),
  getDiatonicChords: jest.fn((key) => Promise.resolve({
    key,
    chords: [
      { name: 'C major', root: 'C', type: 'major', notes: ['C4', 'E4', 'G4'], function: 'I' },
      { name: 'D minor', root: 'D', type: 'minor', notes: ['D4', 'F4', 'A4'], function: 'ii' },
      { name: 'E minor', root: 'E', type: 'minor', notes: ['E4', 'G4', 'B4'], function: 'iii' },
      { name: 'F major', root: 'F', type: 'major', notes: ['F4', 'A4', 'C5'], function: 'IV' },
      { name: 'G major', root: 'G', type: 'major', notes: ['G4', 'B4', 'D5'], function: 'V' },
      { name: 'A minor', root: 'A', type: 'minor', notes: ['A4', 'C5', 'E5'], function: 'vi' },
      { name: 'B diminished', root: 'B', type: 'diminished', notes: ['B4', 'D5', 'F5'], function: 'vii°' }
    ],
    count: 7
  })),
  generateProgression: jest.fn(() => Promise.resolve({
    key: 'C major',
    progression: [
      { name: 'C major', midiNotes: [60, 64, 67], duration: '1/4' },
      { name: 'F major', midiNotes: [65, 69, 72], duration: '1/4' },
      { name: 'G major', midiNotes: [67, 71, 74], duration: '1/4' },
      { name: 'C major', midiNotes: [60, 64, 67], duration: '1/4' }
    ]
  })),
  exportProgression: jest.fn(() => Promise.resolve({
    midiData: 'base64-encoded-midi-data',
    filename: 'chord-progression.mid'
  })),
  validateProgression: jest.fn(() => Promise.resolve({
    isValid: true,
    errors: []
  })),
  calculateProgressionDuration: jest.fn(() => ({
    totalBeats: 4,
    totalSeconds: 2,
    formattedTime: '0:02'
  })),
  formatDuration: jest.fn((duration) => `${duration} beats`),
  createChordObject: jest.fn((name, duration) => ({ name, duration })),
  validateChordObject: jest.fn(() => true),
  formatTime: jest.fn((seconds) => `${Math.floor(seconds / 60)}:${seconds.toString().padStart(2, '0')}`)
}));

describe('ChordProgressionExplorer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the main component', async () => {
    render(<ChordProgressionExplorer />);
    
    expect(screen.getByText('Chord Progression Explorer')).toBeInTheDocument();
    expect(screen.getByText('Key Selection')).toBeInTheDocument();
    expect(screen.getByText('Progression Builder')).toBeInTheDocument();
    expect(screen.getByText('Playback Controls')).toBeInTheDocument();
    expect(screen.getByText('Export Controls')).toBeInTheDocument();
  });

  test('loads and displays available keys', async () => {
    render(<ChordProgressionExplorer />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('C major')).toBeInTheDocument();
    });
  });

  test('changes key selection', async () => {
    render(<ChordProgressionExplorer />);
    
    const keySelect = await screen.findByDisplayValue('C major');
    
    fireEvent.change(keySelect, { target: { value: 'G major' } });
    
    expect(keySelect.value).toBe('G major');
  });

  test('adds chord to progression', async () => {
    render(<ChordProgressionExplorer />);
    
    // Wait for diatonic chords to load
    await waitFor(() => {
      expect(screen.getByText('C major')).toBeInTheDocument();
    });

    // Find and click the "Add" button for C major chord
    const addButton = screen.getAllByText('Add')[0];
    fireEvent.click(addButton);

    // Check if chord was added to progression
    expect(screen.getByText('Progression (1 chord)')).toBeInTheDocument();
  });

  test('removes chord from progression', async () => {
    render(<ChordProgressionExplorer />);
    
    // Wait for diatonic chords to load
    await waitFor(() => {
      expect(screen.getByText('C major')).toBeInTheDocument();
    });

    // Add a chord first
    const addButton = screen.getAllByText('Add')[0];
    fireEvent.click(addButton);

    // Then remove it
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    // Check if chord was removed from progression
    expect(screen.getByText('Progression (0 chords)')).toBeInTheDocument();
  });

  test('generates common progression', async () => {
    render(<ChordProgressionExplorer />);
    
    // Find and click the "Generate Common" button
    const generateButton = screen.getByText('Generate Common');
    fireEvent.click(generateButton);

    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.getByText('Progression (4 chords)')).toBeInTheDocument();
    });
  });

  test('clears progression', async () => {
    render(<ChordProgressionExplorer />);
    
    // Add a chord first
    await waitFor(() => {
      expect(screen.getByText('C major')).toBeInTheDocument();
    });

    const addButton = screen.getAllByText('Add')[0];
    fireEvent.click(addButton);

    // Then clear the progression
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    // Check if progression was cleared
    expect(screen.getByText('Progression (0 chords)')).toBeInTheDocument();
  });

  test('exports progression as MIDI', async () => {
    render(<ChordProgressionExplorer />);
    
    // Add a chord first
    await waitFor(() => {
      expect(screen.getByText('C major')).toBeInTheDocument();
    });

    const addButton = screen.getAllByText('Add')[0];
    fireEvent.click(addButton);

    // Then export as MIDI
    const exportButton = screen.getByText('Export MIDI');
    fireEvent.click(exportButton);

    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByText('Export successful!')).toBeInTheDocument();
    });
  });

  test('handles tempo changes', async () => {
    render(<ChordProgressionExplorer />);
    
    const tempoInput = screen.getByDisplayValue('120');
    
    fireEvent.change(tempoInput, { target: { value: '140' } });
    
    expect(tempoInput.value).toBe('140');
  });

  test('toggles loop functionality', async () => {
    render(<ChordProgressionExplorer />);
    
    const loopButton = screen.getByText('Loop: Off');
    fireEvent.click(loopButton);
    
    expect(screen.getByText('Loop: On')).toBeInTheDocument();
  });

  test('displays error message when API fails', async () => {
    // Mock API failure
    const { getDiatonicChords } = require('../../../../src/client/services/chordProgressionService');
    getDiatonicChords.mockRejectedValueOnce(new Error('API Error'));

    render(<ChordProgressionExplorer />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading diatonic chords/)).toBeInTheDocument();
    });
  });

  test('shows loading state during API calls', async () => {
    // Mock slow API response
    const { getDiatonicChords } = require('../../../../src/client/services/chordProgressionService');
    getDiatonicChords.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ChordProgressionExplorer />);
    
    // Check for loading state
    expect(screen.getByText('Loading chords...')).toBeInTheDocument();
  });

  test('validates progression before export', async () => {
    // Mock validation failure
    const { validateProgression } = require('../../../../src/client/services/chordProgressionService');
    validateProgression.mockResolvedValueOnce({
      isValid: false,
      errors: ['Invalid chord detected']
    });

    render(<ChordProgressionExplorer />);
    
    // Add a chord and try to export
    await waitFor(() => {
      expect(screen.getByText('C major')).toBeInTheDocument();
    });

    const addButton = screen.getAllByText('Add')[0];
    fireEvent.click(addButton);

    const exportButton = screen.getByText('Export MIDI');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid chord detected')).toBeInTheDocument();
    });
  });
});