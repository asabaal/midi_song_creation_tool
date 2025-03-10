// tests/unit/client/components/PatternGenerator.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatternGenerator from '../../../../src/client/components/PatternGenerator';
import { useSessionContext } from '../../../../tests/mocks/SessionContextMock';

// Mock the context provider
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext
}));

// Mock the API service
jest.mock('../../../../src/client/services/apiService', () => ({
  generateChordProgression: jest.fn().mockResolvedValue({
    success: true,
    progression: [
      { root: 'C', octave: 4, chordType: 'major', notes: [60, 64, 67] },
      { root: 'G', octave: 4, chordType: 'major', notes: [67, 71, 74] },
      { root: 'A', octave: 4, chordType: 'minor', notes: [69, 72, 76] },
      { root: 'F', octave: 4, chordType: 'major', notes: [65, 69, 72] }
    ]
  }),
  generateBassline: jest.fn().mockResolvedValue({
    success: true,
    bassline: [
      { pitch: 48, startTime: 0, duration: 1, velocity: 100 },
      { pitch: 55, startTime: 1, duration: 1, velocity: 100 },
      { pitch: 57, startTime: 2, duration: 1, velocity: 100 },
      { pitch: 53, startTime: 3, duration: 1, velocity: 100 }
    ]
  }),
  generateDrumPattern: jest.fn().mockResolvedValue({
    success: true,
    drumPattern: [
      { pitch: 36, startTime: 0, duration: 0.25, velocity: 100 },
      { pitch: 38, startTime: 1, duration: 0.25, velocity: 90 },
      { pitch: 36, startTime: 2, duration: 0.25, velocity: 100 },
      { pitch: 38, startTime: 3, duration: 0.25, velocity: 90 }
    ]
  }),
  generateArpeggio: jest.fn().mockResolvedValue({
    success: true,
    arpeggio: [
      { pitch: 60, startTime: 0, duration: 0.25, velocity: 90 },
      { pitch: 64, startTime: 0.25, duration: 0.25, velocity: 90 },
      { pitch: 67, startTime: 0.5, duration: 0.25, velocity: 90 },
      { pitch: 72, startTime: 0.75, duration: 0.25, velocity: 90 }
    ]
  })
}));

// Mock the CSS imports
jest.mock('../../../../src/client/styles/PatternGenerator.css', () => ({}));

describe('PatternGenerator', () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  
  test('renders pattern generator component', () => {
    render(<PatternGenerator />);
    expect(screen.getByText(/Pattern Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Chord Progression/i)).toBeInTheDocument();
    expect(screen.getByText(/Bassline/i)).toBeInTheDocument();
    expect(screen.getByText(/Drum Pattern/i)).toBeInTheDocument();
  });
  
  test('generates chord progression', async () => {
    const mockAddNotes = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotes: mockAddNotes
    });
    
    render(<PatternGenerator />);
    
    // Find and click the generate chord progression button
    const generateButton = screen.getByText('Generate Chord Progression');
    fireEvent.click(generateButton);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockAddNotes).toHaveBeenCalled();
    });
  });
  
  test('generates bassline', async () => {
    const mockAddNotes = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotes: mockAddNotes
    });
    
    render(<PatternGenerator />);
    
    // Find and click the generate bassline button
    const generateButton = screen.getByText('Generate Bassline');
    fireEvent.click(generateButton);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockAddNotes).toHaveBeenCalled();
    });
  });
  
  test('generates drum pattern', async () => {
    const mockAddNotes = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotes: mockAddNotes
    });
    
    render(<PatternGenerator />);
    
    // Find and click the generate drum pattern button
    const generateButton = screen.getByText('Generate Drum Pattern');
    fireEvent.click(generateButton);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockAddNotes).toHaveBeenCalled();
    });
  });
  
  test('changes key parameter', () => {
    render(<PatternGenerator />);
    
    // Find the key selector
    const keySelector = screen.getByLabelText('Key');
    
    // Change key value
    fireEvent.change(keySelector, { target: { value: 'G' } });
    
    // Verify the select value was updated
    expect(keySelector.value).toBe('G');
  });
  
  test('changes scale type parameter', () => {
    render(<PatternGenerator />);
    
    // Find the scale type selector
    const scaleTypeSelector = screen.getByLabelText('Scale Type');
    
    // Change scale type value
    fireEvent.change(scaleTypeSelector, { target: { value: 'minor' } });
    
    // Verify the select value was updated
    expect(scaleTypeSelector.value).toBe('minor');
  });
  
  test('changes pattern type parameter', () => {
    render(<PatternGenerator />);
    
    // Find the pattern type selector
    const patternTypeSelector = screen.getByLabelText('Pattern Type');
    
    // Change pattern type value
    fireEvent.change(patternTypeSelector, { target: { value: 'funk' } });
    
    // Verify the select value was updated
    expect(patternTypeSelector.value).toBe('funk');
  });
  
  test('changes pattern length parameter', () => {
    render(<PatternGenerator />);
    
    // Find the pattern length selector
    const patternLengthSelector = screen.getByLabelText('Pattern Length');
    
    // Change pattern length value
    fireEvent.change(patternLengthSelector, { target: { value: '8' } });
    
    // Verify the select value was updated
    expect(patternLengthSelector.value).toBe('8');
  });
  
  test('tracks loading state while generating', async () => {
    // Mock a delayed API response
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generateChordProgression.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        progression: []
      }), 100))
    );
    
    render(<PatternGenerator />);
    
    // Find and click the generate button
    const generateButton = screen.getByText('Generate Chord Progression');
    fireEvent.click(generateButton);
    
    // Button should be disabled while loading
    expect(generateButton).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });
  
  test('shows error when generation fails', async () => {
    // Mock an API error
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generateChordProgression.mockRejectedValue(new Error('API error'));
    
    render(<PatternGenerator />);
    
    // Find and click the generate button
    const generateButton = screen.getByText('Generate Chord Progression');
    fireEvent.click(generateButton);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error generating pattern/i)).toBeInTheDocument();
    });
  });
});
