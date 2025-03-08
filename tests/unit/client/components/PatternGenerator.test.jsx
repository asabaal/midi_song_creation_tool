// tests/unit/client/components/PatternGenerator.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatternGenerator from '../../../../src/client/components/PatternGenerator';

// Mock the API service
jest.mock('../../../../src/client/services/apiService', () => ({
  generatePattern: jest.fn().mockResolvedValue({
    notes: [
      { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
      { pitch: 64, startTime: 1, duration: 1, velocity: 100 },
      { pitch: 67, startTime: 2, duration: 1, velocity: 100 }
    ]
  })
}));

// Mock the context provider
jest.mock('../../../../src/client/context/SessionContext', () => ({
  useSessionContext: jest.fn().mockReturnValue({
    currentSession: {
      id: 'test-session',
      tracks: [
        { id: 0, name: 'Piano', instrument: 0 },
        { id: 1, name: 'Bass', instrument: 32 },
        { id: 9, name: 'Drums', instrument: 0 }
      ]
    },
    selectedTrackId: 0,
    setSelectedTrackId: jest.fn(),
    addNotesToTrack: jest.fn()
  })
}));

describe('PatternGenerator', () => {
  test('renders pattern generator component', () => {
    render(<PatternGenerator />);
    
    // Check that all main tabs are rendered
    expect(screen.getByText('Chord Patterns')).toBeInTheDocument();
    expect(screen.getByText('Bassline Patterns')).toBeInTheDocument();
    expect(screen.getByText('Drum Patterns')).toBeInTheDocument();
  });
  
  test('generates chord pattern', async () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockAddNotesToTrack = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotesToTrack: mockAddNotesToTrack
    });
    
    const apiService = require('../../../../src/client/services/apiService');
    
    render(<PatternGenerator />);
    
    // Select the Chord Patterns tab
    fireEvent.click(screen.getByText('Chord Patterns'));
    
    // Fill out chord pattern form
    fireEvent.change(screen.getByLabelText('Root Note'), { 
      target: { value: 'C' } 
    });
    
    fireEvent.change(screen.getByLabelText('Chord Type'), { 
      target: { value: 'major' } 
    });
    
    fireEvent.change(screen.getByLabelText('Octave'), { 
      target: { value: '4' } 
    });
    
    // Click the Generate button
    fireEvent.click(screen.getByText('Generate Chord'));
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          type: 'chord',
          root: 'C',
          chordType: 'major',
          octave: 4,
          trackId: 0
        })
      );
    });
    
    // Check that notes were added to the track
    expect(mockAddNotesToTrack).toHaveBeenCalled();
  });
  
  test('generates bassline pattern', async () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockAddNotesToTrack = jest.fn();
    mockAddNotesToTrack.mockResolvedValue(undefined);
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotesToTrack: mockAddNotesToTrack,
      selectedTrackId: 1 // Select bass track
    });
    
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generatePattern.mockResolvedValue({
      notes: [
        { pitch: 36, startTime: 0, duration: 1, velocity: 100 },
        { pitch: 43, startTime: 1, duration: 1, velocity: 100 },
        { pitch: 40, startTime: 2, duration: 1, velocity: 100 }
      ]
    });
    
    render(<PatternGenerator />);
    
    // Select the Bassline Patterns tab
    fireEvent.click(screen.getByText('Bassline Patterns'));
    
    // Select bassline style
    fireEvent.change(screen.getByLabelText('Style'), { 
      target: { value: 'walking' } 
    });
    
    // Enter chord progression
    fireEvent.change(screen.getByLabelText('Chord Roots'), { 
      target: { value: 'C G F C' } 
    });
    
    // Click the Generate button
    fireEvent.click(screen.getByText('Generate Bassline'));
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          type: 'bassline',
          style: 'walking',
          trackId: 1
        })
      );
    });
    
    // Check that notes were added to the track
    expect(mockAddNotesToTrack).toHaveBeenCalled();
  });
  
  test('generates drum pattern', async () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockAddNotesToTrack = jest.fn();
    mockAddNotesToTrack.mockResolvedValue(undefined);
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotesToTrack: mockAddNotesToTrack,
      selectedTrackId: 9 // Select drum track
    });
    
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generatePattern.mockResolvedValue({
      notes: [
        { pitch: 36, startTime: 0, duration: 0.25, velocity: 100 }, // Kick
        { pitch: 38, startTime: 1, duration: 0.25, velocity: 90 },  // Snare
        { pitch: 42, startTime: 0.5, duration: 0.25, velocity: 80 } // Hi-hat closed
      ]
    });
    
    render(<PatternGenerator />);
    
    // Select the Drum Patterns tab
    fireEvent.click(screen.getByText('Drum Patterns'));
    
    // Select drum pattern style
    fireEvent.change(screen.getByLabelText('Style'), { 
      target: { value: 'basic' } 
    });
    
    // Set number of bars
    fireEvent.change(screen.getByLabelText('Bars'), { 
      target: { value: '2' } 
    });
    
    // Click the Generate button
    fireEvent.click(screen.getByText('Generate Drum Pattern'));
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          type: 'drum',
          style: 'basic',
          bars: 2,
          trackId: 9
        })
      );
    });
    
    // Check that notes were added to the track
    expect(mockAddNotesToTrack).toHaveBeenCalled();
  });
  
  test('handles pattern generation errors', async () => {
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generatePattern.mockRejectedValue(new Error('Pattern generation failed'));
    
    render(<PatternGenerator />);
    
    // Select the Chord Patterns tab
    fireEvent.click(screen.getByText('Chord Patterns'));
    
    // Click generate without filling form
    fireEvent.click(screen.getByText('Generate Chord'));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error: Pattern generation failed')).toBeInTheDocument();
    });
  });
  
  test('updates track selection', () => {
    const { useSessionContext } = require('../../../../src/client/context/SessionContext');
    const mockSetSelectedTrackId = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      setSelectedTrackId: mockSetSelectedTrackId
    });
    
    render(<PatternGenerator />);
    
    // Select the Chord Patterns tab
    fireEvent.click(screen.getByText('Chord Patterns'));
    
    // Find and change the track select
    fireEvent.change(screen.getByLabelText('Target Track'), { 
      target: { value: '1' } 
    });
    
    expect(mockSetSelectedTrackId).toHaveBeenCalledWith(1);
  });
  
  test('previews pattern before adding', async () => {
    const apiService = require('../../../../src/client/services/apiService');
    
    // Create a component with the preview feature
    render(<PatternGenerator />);
    
    // Select the Chord Patterns tab
    fireEvent.click(screen.getByText('Chord Patterns'));
    
    // Fill basic form
    fireEvent.change(screen.getByLabelText('Root Note'), { 
      target: { value: 'C' } 
    });
    
    // Click Preview button if available
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    // Wait for API call
    await waitFor(() => {
      expect(apiService.generatePattern).toHaveBeenCalled();
    });
    
    // Check that the preview display shows
    const previewDisplay = screen.getByTestId('pattern-preview');
    expect(previewDisplay).toBeInTheDocument();
    
    // Verify preview content (this would depend on your component implementation)
    expect(previewDisplay.textContent).toContain('C');
    expect(previewDisplay.textContent).toContain('E');
    expect(previewDisplay.textContent).toContain('G');
  });
});