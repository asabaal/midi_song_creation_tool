import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/VirtualKeyboard.css';

/**
 * Virtual Piano Keyboard Component
 * 
 * Renders an interactive piano keyboard that can trigger MIDI notes
 * and highlight currently playing notes.
 */
const VirtualKeyboard = ({ 
  octaves = 2,
  startOctave = 4,
  activeNotes = [],
  onNoteOn,
  onNoteOff,
  showNoteNames = false
}) => {
  // Array to track which keys are currently pressed
  const [pressedKeys, setPressedKeys] = useState([]);
  
  // Define white and black key indices within an octave
  const whiteKeyIndices = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
  const blackKeyIndices = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
  
  // Note names for labels
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Update pressedKeys when activeNotes changes (for external control)
  useEffect(() => {
    // Use object equality to prevent infinite loop
    if (JSON.stringify(pressedKeys) !== JSON.stringify(activeNotes)) {
      setPressedKeys(activeNotes);
    }
  }, [activeNotes, pressedKeys]);
  
  // Calculate MIDI note number from octave and note index
  const getMidiNote = (octave, noteIndex) => {
    return (octave + 1) * 12 + noteIndex;
  };

  // Handle mouse down on key
  const handleMouseDown = (midiNote) => {
    if (!pressedKeys.includes(midiNote)) {
      setPressedKeys(prev => [...prev, midiNote]);
      if (onNoteOn) onNoteOn(midiNote, 100); // 100 is velocity
    }
  };
  
  // Handle mouse up on key
  const handleMouseUp = (midiNote) => {
    setPressedKeys(prev => prev.filter(note => note !== midiNote));
    if (onNoteOff) onNoteOff(midiNote);
  };
  
  // Generate the white keys for the keyboard
  const renderWhiteKeys = () => {
    const keys = [];
    
    for (let octave = startOctave; octave < startOctave + octaves; octave++) {
      whiteKeyIndices.forEach(noteIndex => {
        const midiNote = getMidiNote(octave, noteIndex);
        const isActive = pressedKeys.includes(midiNote);
        
        keys.push(
          <div
            key={`white-${midiNote}`}
            className={`white-key ${isActive ? 'active' : ''}`}
            onMouseDown={() => handleMouseDown(midiNote)}
            onMouseUp={() => handleMouseUp(midiNote)}
            onMouseLeave={() => handleMouseUp(midiNote)}
          >
            {showNoteNames && (
              <div className="note-name">
                {noteNames[noteIndex]}{octave}
              </div>
            )}
          </div>
        );
      });
    }
    
    return keys;
  };
  
  // Generate the black keys for the keyboard
  const renderBlackKeys = () => {
    const keys = [];
    const whiteKeyWidth = 100 / (octaves * 7); // Percentage width of a white key
    
    for (let octave = startOctave; octave < startOctave + octaves; octave++) {
      blackKeyIndices.forEach((noteIndex, i) => {
        // Calculate position based on preceding white keys
        const precedingWhiteKeys = whiteKeyIndices.findIndex(index => index > noteIndex);
        const offset = (octave - startOctave) * 7 + precedingWhiteKeys;
        const leftPosition = offset * whiteKeyWidth - whiteKeyWidth * 0.25;
        
        const midiNote = getMidiNote(octave, noteIndex);
        const isActive = pressedKeys.includes(midiNote);
        
        keys.push(
          <div
            key={`black-${midiNote}`}
            className={`black-key ${isActive ? 'active' : ''}`}
            style={{ left: `${leftPosition}%` }}
            onMouseDown={() => handleMouseDown(midiNote)}
            onMouseUp={() => handleMouseUp(midiNote)}
            onMouseLeave={() => handleMouseUp(midiNote)}
          >
            {showNoteNames && (
              <div className="note-name">
                {noteNames[noteIndex]}{octave}
              </div>
            )}
          </div>
        );
      });
    }
    
    return keys;
  };
  
  return (
    <div className="virtual-keyboard" data-testid="virtual-keyboard">
      <div className="white-keys">
        {renderWhiteKeys()}
      </div>
      <div className="black-keys">
        {renderBlackKeys()}
      </div>
    </div>
  );
};

VirtualKeyboard.propTypes = {
  octaves: PropTypes.number,
  startOctave: PropTypes.number,
  activeNotes: PropTypes.arrayOf(PropTypes.number),
  onNoteOn: PropTypes.func,
  onNoteOff: PropTypes.func,
  showNoteNames: PropTypes.bool
};

export default VirtualKeyboard;