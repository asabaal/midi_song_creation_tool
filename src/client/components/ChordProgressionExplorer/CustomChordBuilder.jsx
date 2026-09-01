import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import VirtualKeyboard from '../VirtualKeyboard';
import * as chordProgressionService from '../../services/chordProgressionService';

/**
 * Custom Chord Builder Component
 * 
 * Allows users to create custom chords by selecting notes on a virtual keyboard,
 * with automatic chord analysis and validation.
 */
const CustomChordBuilder = ({ onChordCreated, isVisible = true }) => {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [chordAnalysis, setChordAnalysis] = useState(null);
  const [chordName, setChordName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validation, setValidation] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(true);

  // Analyze chord whenever selected notes change
  useEffect(() => {
    const analyzeNotes = async () => {
      if (selectedNotes.length < 2) {
        setChordAnalysis(null);
        setValidation(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        // Convert MIDI notes to note names for API
        const noteNames = selectedNotes.map(midiNote => {
          const noteName = midiToNote(midiNote);
          return noteName;
        });

        // Analyze the chord
        const analysis = await chordProgressionService.analyzeCustomChord(noteNames);
        setChordAnalysis(analysis.analysis);
        setValidation(analysis.validation);

        // Auto-generate chord name if analysis is successful
        if (analysis.analysis && analysis.analysis.type !== 'unknown') {
          const root = analysis.analysis.root;
          const type = analysis.analysis.type;
          setChordName(`${root} ${type}`);
        }
      } catch (error) {
        console.error('Error analyzing chord:', error);
        setChordAnalysis({ type: 'error', error: error.message });
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timeoutId = setTimeout(analyzeNotes, 300); // Debounce analysis
    return () => clearTimeout(timeoutId);
  }, [selectedNotes]);

  // Convert MIDI note to note name (helper function)
  const midiToNote = (midiNote) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return noteNames[noteIndex] + octave;
  };

  // Handle note selection from virtual keyboard
  const handleNoteSelection = (midiNote, velocity) => {
    if (velocity > 0) { // Note on
      if (!selectedNotes.includes(midiNote)) {
        setSelectedNotes([...selectedNotes, midiNote]);
      }
    } else { // Note off
      setSelectedNotes(selectedNotes.filter(note => note !== midiNote));
    }
  };

  // Clear all selected notes
  const clearSelection = () => {
    setSelectedNotes([]);
    setChordAnalysis(null);
    setValidation(null);
    setChordName('');
  };

  // Save the custom chord
  const saveCustomChord = () => {
    if (selectedNotes.length < 2) {
      alert('Please select at least 2 notes to create a chord');
      return;
    }

    if (!chordName.trim()) {
      alert('Please enter a name for your custom chord');
      return;
    }

    if (validation && !validation.isValid) {
      alert('Chord validation failed: ' + validation.errors.join(', '));
      return;
    }

    const customChord = {
      id: Date.now(),
      name: chordName.trim(),
      notes: selectedNotes,
      noteNames: selectedNotes.map(midiToNote),
      analysis: chordAnalysis,
      validation: validation,
      isCustom: true
    };

    onChordCreated(customChord);
    
    // Reset form
    clearSelection();
    setChordName('');
  };

  // Remove a specific note from selection
  const removeNote = (midiNote) => {
    setSelectedNotes(selectedNotes.filter(note => note !== midiNote));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="custom-chord-builder">
      <div className="section-header">
        <h3 className="section-title">Custom Chord Builder</h3>
        <button
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="btn btn-small btn-secondary"
        >
          {showKeyboard ? 'Hide' : 'Show'} Keyboard
        </button>
      </div>

      <div className="chord-builder-content">
        {/* Selected Notes Display */}
        <div className="selected-notes-section">
          <div className="selected-notes-header">
            <span className="notes-label">Selected Notes ({selectedNotes.length}):</span>
            {selectedNotes.length > 0 && (
              <button onClick={clearSelection} className="btn btn-small btn-danger">
                Clear All
              </button>
            )}
          </div>
          
          <div className="selected-notes">
            {selectedNotes.length === 0 ? (
              <div className="no-notes">Click on the keyboard to select notes</div>
            ) : (
              <div className="notes-list">
                {selectedNotes.map(midiNote => (
                  <div key={midiNote} className="selected-note">
                    <span className="note-name">{midiToNote(midiNote)}</span>
                    <button
                      onClick={() => removeNote(midiNote)}
                      className="remove-note"
                      aria-label={`Remove ${midiToNote(midiNote)}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chord Analysis */}
        {isAnalyzing && (
          <div className="analysis-loading">
            <div className="loading-small"></div>
            <span>Analyzing chord...</span>
          </div>
        )}

        {chordAnalysis && !isAnalyzing && (
          <div className="chord-analysis">
            <h4>Chord Analysis</h4>
            
            {chordAnalysis.type === 'error' ? (
              <div className="analysis-error">
                <span className="error-icon">⚠️</span>
                <span>Analysis failed: {chordAnalysis.error}</span>
              </div>
            ) : (
              <div className="analysis-results">
                <div className="analysis-item">
                  <span className="analysis-label">Detected Type:</span>
                  <span className={`analysis-value ${
                    chordAnalysis.type === 'unknown' ? 'text-muted' : 'text-success'
                  }`}>
                    {chordAnalysis.type === 'unknown' ? 'Unknown' : chordAnalysis.type}
                  </span>
                </div>
                
                {chordAnalysis.root && (
                  <div className="analysis-item">
                    <span className="analysis-label">Root:</span>
                    <span className="analysis-value">{chordAnalysis.root}</span>
                  </div>
                )}
                
                {chordAnalysis.confidence !== undefined && (
                  <div className="analysis-item">
                    <span className="analysis-label">Confidence:</span>
                    <span className="analysis-value">
                      {Math.round(chordAnalysis.confidence * 100)}%
                    </span>
                  </div>
                )}
                
                {chordAnalysis.suggestions && chordAnalysis.suggestions.length > 0 && (
                  <div className="analysis-suggestions">
                    <span className="analysis-label">Suggestions:</span>
                    <ul className="suggestions-list">
                      {chordAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="suggestion-item">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Validation Results */}
        {validation && (
          <div className={`validation-results ${validation.isValid ? 'valid' : 'invalid'}`}>
            {validation.isValid ? (
              <div className="validation-success">
                <span className="success-icon">✓</span>
                <span>Valid chord structure</span>
              </div>
            ) : (
              <div className="validation-errors">
                <span className="error-icon">⚠️</span>
                <div>
                  <span>Validation errors:</span>
                  <ul className="errors-list">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="error-item">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chord Naming and Save */}
        <div className="chord-controls">
          <div className="chord-name-input">
            <label htmlFor="chord-name" className="form-label">Chord Name:</label>
            <input
              id="chord-name"
              type="text"
              value={chordName}
              onChange={(e) => setChordName(e.target.value)}
              placeholder="Enter chord name..."
              className="form-control"
              maxLength={50}
            />
          </div>
          
          <button
            onClick={saveCustomChord}
            disabled={selectedNotes.length < 2 || !chordName.trim() || (validation && !validation.isValid)}
            className="btn btn-primary"
          >
            Save Custom Chord
          </button>
        </div>

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <div className="keyboard-section">
            <h4>Virtual Keyboard</h4>
            <VirtualKeyboard
              octaves={2}
              startOctave={3}
              showNoteNames={true}
              activeNotes={selectedNotes}
              onNoteOn={handleNoteSelection}
              onNoteOff={handleNoteSelection}
            />
          </div>
        )}
      </div>
    </div>
  );
};

CustomChordBuilder.propTypes = {
  onChordCreated: PropTypes.func.isRequired,
  isVisible: PropTypes.bool
};

export default CustomChordBuilder;