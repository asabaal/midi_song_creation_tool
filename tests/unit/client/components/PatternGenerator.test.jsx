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
  generatePattern: jest.fn().mockResolvedValue({
    notes: [
      { id: 'note1', pitch: 60, startTime: 0, duration: 1, velocity: 100 },
      { id: 'note2', pitch: 64, startTime: 0, duration: 1, velocity: 100 },
      { id: 'note3', pitch: 67, startTime: 0, duration: 1, velocity: 100 }
    ],
    type: 'chord'
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
    
    // Check for the tab buttons in the component
    expect(screen.getByText(/Chord Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/Bassline Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/Drum Patterns/i)).toBeInTheDocument();
  });
  
  test('generates chord pattern', async () => {
    const mockAddNotesToTrack = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotesToTrack: mockAddNotesToTrack
    });
    
    render(<PatternGenerator />);
    
    // Find and click the generate chord button
    const generateButton = screen.getByText(/Generate Chord/i);
    fireEvent.click(generateButton);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockAddNotesToTrack).toHaveBeenCalled();
    });
  });
  
  test('generates bassline pattern', async () => {
    const mockAddNotesToTrack = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotesToTrack: mockAddNotesToTrack
    });
    
    render(<PatternGenerator />);
    
    // Click on the Bassline Patterns tab
    fireEvent.click(screen.getByText(/Bassline Patterns/i));
    
    // Find and click the generate bassline button
    const generateButton = screen.getByText(/Generate Bassline/i);
    fireEvent.click(generateButton);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockAddNotesToTrack).toHaveBeenCalled();
    });
  });
  
  test('generates drum pattern', async () => {
    const mockAddNotesToTrack = jest.fn();
    useSessionContext.mockReturnValue({
      ...useSessionContext(),
      addNotesToTrack: mockAddNotesToTrack
    });
    
    render(<PatternGenerator />);
    
    // Click on the Drum Patterns tab
    fireEvent.click(screen.getByText(/Drum Patterns/i));
    
    // Find and click the generate drum pattern button
    const generateButton = screen.getByText(/Generate Drum Pattern/i);
    fireEvent.click(generateButton);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockAddNotesToTrack).toHaveBeenCalled();
    });
  });
  
  test('changes root note parameter', () => {
    render(<PatternGenerator />);
    
    // Find the root note selector
    const rootSelector = screen.getByLabelText(/Root Note/i);
    
    // Change root value
    fireEvent.change(rootSelector, { target: { value: 'G' } });
    
    // Verify the select value was updated
    expect(rootSelector.value).toBe('G');
  });
  
  test('changes chord type parameter', () => {
    render(<PatternGenerator />);
    
    // Find the chord type selector
    const chordTypeSelector = screen.getByLabelText(/Chord Type/i);
    
    // Change chord type value
    fireEvent.change(chordTypeSelector, { target: { value: 'minor' } });
    
    // Verify the select value was updated
    expect(chordTypeSelector.value).toBe('minor');
  });
  
  test('changes style parameter in bassline tab', () => {
    render(<PatternGenerator />);
    
    // Click on the Bassline Patterns tab
    fireEvent.click(screen.getByText(/Bassline Patterns/i));
    
    // Find the style selector
    const styleSelector = screen.getByLabelText(/Style/i);
    
    // Change style value
    fireEvent.change(styleSelector, { target: { value: 'pattern' } });
    
    // Verify the select value was updated
    expect(styleSelector.value).toBe('pattern');
  });
  
  test('changes bars parameter in drum tab', () => {
    render(<PatternGenerator />);
    
    // Click on the Drum Patterns tab
    fireEvent.click(screen.getByText(/Drum Patterns/i));
    
    // Find the bars selector
    const barsSelector = screen.getByLabelText(/Bars/i);
    
    // Change bars value
    fireEvent.change(barsSelector, { target: { value: '4' } });
    
    // Verify the select value was updated
    expect(barsSelector.value).toBe('4');
  });
  
  test('tracks loading state while generating', async () => {
    // Mock a delayed API response
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generatePattern.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        notes: [],
        type: 'chord'
      }), 100))
    );
    
    render(<PatternGenerator />);
    
    // Find and click the generate button
    const generateButton = screen.getByText(/Generate Chord/i);
    fireEvent.click(generateButton);
    
    // Button should be disabled while loading
    expect(generateButton).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });
  
  test('shows preview when clicking preview button', async () => {
    const apiService = require('../../../../src/client/services/apiService');
    apiService.generatePattern.mockResolvedValue({
      notes: [
        { id: 'note1', pitch: 60, startTime: 0, duration: 1, velocity: 100 },
        { id: 'note2', pitch: 64, startTime: 0, duration: 1, velocity: 100 },
        { id: 'note3', pitch: 67, startTime: 0, duration: 1, velocity: 100 }
      ],
      type: 'chord'
    });
    
    render(<PatternGenerator />);
    
    // Find and click the preview button
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    // Wait for the preview to appear
    await waitFor(() => {
      expect(screen.getByTestId('pattern-preview')).toBeInTheDocument();
    });
  });
});
