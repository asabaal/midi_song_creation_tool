import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualKeyboard from '../../../../src/client/components/VirtualKeyboard';

// Mock CSS import
jest.mock('../../../../src/client/styles/VirtualKeyboard.css', () => ({}));

describe('VirtualKeyboard Component', () => {
  
  test('renders with default props', () => {
    render(<VirtualKeyboard />);
    
    // Virtual keyboard should be in the document
    const keyboard = screen.getByTestId('virtual-keyboard');
    expect(keyboard).toBeInTheDocument();
    
    // Default props: 2 octaves, starting at octave 4
    const whiteKeys = keyboard.querySelectorAll('.white-key');
    expect(whiteKeys.length).toBe(14); // 7 white keys per octave × 2 octaves
    
    const blackKeys = keyboard.querySelectorAll('.black-key');
    expect(blackKeys.length).toBe(10); // 5 black keys per octave × 2 octaves
  });
  
  test('renders with custom octaves and startOctave', () => {
    render(<VirtualKeyboard octaves={3} startOctave={3} />);
    
    const keyboard = screen.getByTestId('virtual-keyboard');
    const whiteKeys = keyboard.querySelectorAll('.white-key');
    const blackKeys = keyboard.querySelectorAll('.black-key');
    
    expect(whiteKeys.length).toBe(21); // 7 white keys per octave × 3 octaves
    expect(blackKeys.length).toBe(15); // 5 black keys per octave × 3 octaves
  });
  
  test('shows note names when showNoteNames is true', () => {
    render(<VirtualKeyboard showNoteNames={true} />);
    
    const noteNames = screen.queryAllByText(/[A-G]#?\d/); // Regex to match note names like C4, F#5
    expect(noteNames.length).toBeGreaterThan(0);
  });
  
  test('does not show note names by default', () => {
    render(<VirtualKeyboard />);
    
    const noteNames = screen.queryAllByText(/[A-G]#?\d/);
    expect(noteNames.length).toBe(0);
  });
  
  test('highlights active notes', () => {
    // C4 and E4 should be highlighted (MIDI notes 60 and 64)
    const activeNotes = [60, 64];
    render(<VirtualKeyboard activeNotes={activeNotes} />);
    
    const keyboard = screen.getByTestId('virtual-keyboard');
    const activeKeys = keyboard.querySelectorAll('.white-key.active');
    
    expect(activeKeys.length).toBe(2);
  });
  
  test('calls onNoteOn when keys are pressed', () => {
    const onNoteOn = jest.fn();
    render(<VirtualKeyboard onNoteOn={onNoteOn} />);
    
    const keyboard = screen.getByTestId('virtual-keyboard');
    const whiteKeys = keyboard.querySelectorAll('.white-key');
    
    // Press the first white key (C4, MIDI note 60)
    fireEvent.mouseDown(whiteKeys[0]);
    
    expect(onNoteOn).toHaveBeenCalledWith(60, 100); // Note 60 with velocity 100
  });
  
  test('calls onNoteOff when keys are released', () => {
    const onNoteOff = jest.fn();
    render(<VirtualKeyboard onNoteOff={onNoteOff} />);
    
    const keyboard = screen.getByTestId('virtual-keyboard');
    const whiteKeys = keyboard.querySelectorAll('.white-key');
    
    // Press and release the first white key (C4, MIDI note 60)
    fireEvent.mouseDown(whiteKeys[0]);
    fireEvent.mouseUp(whiteKeys[0]);
    
    expect(onNoteOff).toHaveBeenCalledWith(60);
  });
  
  test('calls onNoteOff when mouse leaves a pressed key', () => {
    const onNoteOff = jest.fn();
    render(<VirtualKeyboard onNoteOff={onNoteOff} />);
    
    const keyboard = screen.getByTestId('virtual-keyboard');
    const whiteKeys = keyboard.querySelectorAll('.white-key');
    
    // Press and move mouse out of the first white key (C4, MIDI note 60)
    fireEvent.mouseDown(whiteKeys[0]);
    fireEvent.mouseLeave(whiteKeys[0]);
    
    expect(onNoteOff).toHaveBeenCalledWith(60);
  });
  
  test('correctly calculates MIDI note numbers for all keys', () => {
    const onNoteOn = jest.fn();
    render(<VirtualKeyboard octaves={1} startOctave={4} onNoteOn={onNoteOn} />);
    
    const keyboard = screen.getByTestId('virtual-keyboard');
    const whiteKeys = keyboard.querySelectorAll('.white-key');
    const blackKeys = keyboard.querySelectorAll('.black-key');
    
    // Test white keys (C4 through B4)
    const expectedWhiteNotes = [60, 62, 64, 65, 67, 69, 71]; // C4, D4, E4, F4, G4, A4, B4
    
    whiteKeys.forEach((key, index) => {
      fireEvent.mouseDown(key);
      expect(onNoteOn).toHaveBeenLastCalledWith(expectedWhiteNotes[index], 100);
    });
    
    onNoteOn.mockClear();
    
    // Test black keys (C#4 through A#4)
    const expectedBlackNotes = [61, 63, 66, 68, 70]; // C#4, D#4, F#4, G#4, A#4
    
    blackKeys.forEach((key, index) => {
      fireEvent.mouseDown(key);
      expect(onNoteOn).toHaveBeenLastCalledWith(expectedBlackNotes[index], 100);
    });
  });
});
