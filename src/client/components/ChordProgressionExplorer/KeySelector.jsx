import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as chordProgressionService from '../../services/chordProgressionService';

/**
 * Key Selector Component
 * 
 * Allows users to select from all 24 major and minor keys
 * and displays the key signature visually.
 */
const KeySelector = ({ selectedKey, onKeyChange, loading = false }) => {
  const [availableKeys, setAvailableKeys] = useState({ major: [], minor: [], all: [] });
  const [keySignature, setKeySignature] = useState(null);

  // Load available keys on component mount
  useEffect(() => {
    const loadKeys = async () => {
      try {
        const keysData = await chordProgressionService.getKeys();
        setAvailableKeys(keysData);
      } catch (error) {
        console.error('Error loading keys:', error);
      }
    };

    loadKeys();
  }, []);

  // Update key signature when selected key changes
  useEffect(() => {
    const updateKeySignature = async () => {
      try {
        // For now, we'll create a simple key signature display
        // In a full implementation, you might want to get this from the API
        const [note, mode] = selectedKey.split(' ');
        const accidentals = getKeySignatureDisplay(selectedKey);
        setKeySignature(accidentals);
      } catch (error) {
        console.error('Error updating key signature:', error);
      }
    };

    updateKeySignature();
  }, [selectedKey]);

  // Get key signature display (sharps/flats)
  const getKeySignatureDisplay = (key) => {
    const sharpKeys = {
      'C major': '',
      'G major': 'F#',
      'D major': 'F#, C#',
      'A major': 'F#, C#, G#',
      'E major': 'F#, C#, G#, D#',
      'B major': 'F#, C#, G#, D#, A#',
      'F# major': 'F#, C#, G#, D#, A#, E#',
      'C# major': 'F#, C#, G#, D#, A#, E#, B#',
      'A minor': '',
      'E minor': 'F#',
      'B minor': 'F#, C#',
      'F# minor': 'F#, C#, G#',
      'C# minor': 'F#, C#, G#, D#',
      'G# minor': 'F#, C#, G#, D#, A#',
      'D# minor': 'F#, C#, G#, D#, A#, E#',
      'A# minor': 'F#, C#, G#, D#, A#, E#, B#'
    };

    const flatKeys = {
      'F major': 'Bb',
      'Bb major': 'Bb, Eb',
      'Eb major': 'Bb, Eb, Ab',
      'Ab major': 'Bb, Eb, Ab, Db',
      'Db major': 'Bb, Eb, Ab, Db, Gb',
      'Gb major': 'Bb, Eb, Ab, Db, Gb, Cb',
      'Cb major': 'Bb, Eb, Ab, Db, Gb, Cb, Fb',
      'D minor': 'Bb',
      'G minor': 'Bb, Eb',
      'C minor': 'Bb, Eb, Ab',
      'F minor': 'Bb, Eb, Ab, Db',
      'Bb minor': 'Bb, Eb, Ab, Db, Gb',
      'Eb minor': 'Bb, Eb, Ab, Db, Gb, Cb',
      'Ab minor': 'Bb, Eb, Ab, Db, Gb, Cb, Fb'
    };

    return sharpKeys[key] || flatKeys[key] || '';
  };

  // Handle key change
  const handleKeyChange = (event) => {
    const newKey = event.target.value;
    onKeyChange(newKey);
  };

  // Group keys by mode for better organization
  const groupKeysByMode = () => {
    const majorKeys = availableKeys.major || [];
    const minorKeys = availableKeys.minor || [];
    
    return { major: majorKeys, minor: minorKeys };
  };

  const { major: majorKeys, minor: minorKeys } = groupKeysByMode();

  return (
    <div className="key-selector">
      <div className="section-header">
        <h3 className="section-title">Key Selection</h3>
        {loading && <div className="loading-small"></div>}
      </div>
      
      <div className="key-controls">
        <div className="key-dropdown-container">
          <label htmlFor="key-select" className="form-label">
            Select Key:
          </label>
          <select
            id="key-select"
            value={selectedKey}
            onChange={handleKeyChange}
            className="form-control key-dropdown"
            disabled={loading}
          >
            <optgroup label="Major Keys">
              {majorKeys.map(key => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </optgroup>
            <optgroup label="Minor Keys">
              {minorKeys.map(key => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="key-signature-display">
          <span className="signature-label">Key Signature:</span>
          <div className="signature-accidentals">
            {keySignature ? (
              <span className="accidentals-text">{keySignature}</span>
            ) : (
              <span className="accidentals-text accidentals-empty">C (no sharps or flats)</span>
            )}
          </div>
        </div>
      </div>

      <div className="key-info">
        <div className="key-info-item">
          <span className="info-label">Current Key:</span>
          <span className="info-value">{selectedKey}</span>
        </div>
        <div className="key-info-item">
          <span className="info-label">Mode:</span>
          <span className="info-value">
            {selectedKey.includes('major') ? 'Major' : 'Minor'}
          </span>
        </div>
        <div className="key-info-item">
          <span className="info-label">Tonic:</span>
          <span className="info-value">
            {selectedKey.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

KeySelector.propTypes = {
  selectedKey: PropTypes.string.isRequired,
  onKeyChange: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default KeySelector;