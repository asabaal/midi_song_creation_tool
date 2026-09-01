import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Duration Selector Component
 * 
 * Provides interface for selecting chord durations with preset buttons
 * and custom duration input.
 */
const DurationSelector = ({ selectedDuration = '1', onDurationSelect }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

  // Preset duration options
  const presetDurations = [
    { value: '4', label: 'Quarter', beats: 1, symbol: '♩' },
    { value: '2', label: 'Half', beats: 2, symbol: '𝅗𝅥' },
    { value: '1', label: 'Whole', beats: 4, symbol: '𝅝' },
    { value: '1/2', label: 'Eighth', beats: 0.5, symbol: '♪' },
    { value: '1/4', label: 'Sixteenth', beats: 0.25, symbol: '♬' }
  ];

  // Handle preset duration selection
  const handlePresetSelect = (duration) => {
    onDurationSelect(duration.value);
    setShowCustomInput(false);
    setCustomDuration('');
  };

  // Handle custom duration input
  const handleCustomInputChange = (e) => {
    setCustomDuration(e.target.value);
  };

  // Apply custom duration
  const handleApplyCustom = () => {
    if (customDuration && isValidDuration(customDuration)) {
      onDurationSelect(customDuration);
      setShowCustomInput(false);
    } else {
      alert('Invalid duration format. Use formats like: 1, 2, 1/2, 3/4, 1.5');
    }
  };

  // Validate duration format
  const isValidDuration = (duration) => {
    // Check if duration is valid
    if (!duration || typeof duration !== 'string') {
      return false;
    }
    
    // Check for simple fraction (e.g., 1/2, 3/4)
    if (duration.includes('/')) {
      const parts = duration.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        return !isNaN(numerator) && !isNaN(denominator) && denominator !== 0;
      }
      return false;
    }
    
    // Check for decimal number
    const num = parseFloat(duration);
    return !isNaN(num) && num > 0;
  };

  // Format duration for display
  const formatDurationDisplay = (duration) => {
    if (!duration || typeof duration !== 'string') {
      return '1';
    }
    
    if (duration.includes('/')) {
      return duration;
    }
    
    const num = parseFloat(duration);
    if (Number.isInteger(num)) {
      return duration;
    }
    
    return num.toFixed(2);
  };

  // Get duration in beats for display
  const getDurationInBeats = (duration) => {
    if (!duration || typeof duration !== 'string') {
      return 1; // Default to 1 beat
    }
    
    if (duration.includes('/')) {
      const [numerator, denominator] = duration.split('/').map(Number);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
      return 1; // Fallback for invalid fractions
    }
    
    // Handle standard musical notation (where 1 = whole note = 4 beats)
    const num = parseFloat(duration);
    if (!isNaN(num) && num > 0) {
      // Convert musical notation to beats
      // 1 = whole note (4 beats), 2 = half note (2 beats), 4 = quarter note (1 beat)
      if (num === 1) return 4;  // Whole note
      if (num === 2) return 2;  // Half note  
      if (num === 4) return 1;  // Quarter note
      if (num === 8) return 0.5; // Eighth note
      if (num === 16) return 0.25; // Sixteenth note
      return num; // For other values, assume they're already in beats
    }
    
    return 1; // Fallback for invalid numbers
  };

  const currentBeats = getDurationInBeats(selectedDuration);
  


  return (
    <div className="duration-selector">
      <div className="duration-presets">
        {presetDurations.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetSelect(preset.value)}
            className={`duration-preset ${selectedDuration === preset.value ? 'selected' : ''}`}
            title={`${preset.label} note (${preset.beats} beat${preset.beats !== 1 ? 's' : ''})`}
          >
            <div className="duration-symbol">{preset.symbol}</div>
            <div className="duration-label">{preset.label}</div>
            <div className="duration-beats">{preset.beats} beat{preset.beats !== 1 ? 's' : ''}</div>
          </button>
        ))}
      </div>

      <div className="custom-duration-section">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`btn btn-small ${showCustomInput ? 'btn-secondary' : ''}`}
        >
          {showCustomInput ? 'Hide' : 'Custom'} Duration
        </button>

        {showCustomInput && (
          <div className="custom-duration-input">
            <input
              type="text"
              placeholder="e.g., 1/2, 3/4, 1.5"
              value={customDuration}
              onChange={handleCustomInputChange}
              className="form-control"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCustom();
                }
              }}
            />
            <button
              onClick={handleApplyCustom}
              disabled={!customDuration || !isValidDuration(customDuration)}
              className="btn btn-small"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Current Duration Display */}
      <div className="current-duration">
        <span className="current-label">Current Duration:</span>
        <div className="current-value">
          <span className="duration-text">{formatDurationDisplay(selectedDuration)}</span>
          <span className="duration-beats-display">
            ({currentBeats} beat{currentBeats !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Duration Examples */}
      <div className="duration-examples">
        <details>
          <summary className="examples-toggle">Duration Examples</summary>
          <div className="examples-content">
            <div className="example-group">
              <h5>Standard Notation:</h5>
              <ul>
                <li><code>1</code> - Whole note (4 beats)</li>
                <li><code>2</code> - Half note (2 beats)</li>
                <li><code>4</code> - Quarter note (1 beat)</li>
                <li><code>8</code> - Eighth note (0.5 beats)</li>
              </ul>
            </div>
            <div className="example-group">
              <h5>Fractions:</h5>
              <ul>
                <li><code>1/2</code> - Half beat</li>
                <li><code>3/4</code> - Three quarters of a beat</li>
                <li><code>5/4</code> - One and a quarter beats</li>
              </ul>
            </div>
            <div className="example-group">
              <h5>Decimals:</h5>
              <ul>
                <li><code>1.5</code> - One and a half beats</li>
                <li><code>0.75</code> - Three quarters of a beat</li>
                <li><code>2.25</code> - Two and a quarter beats</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

DurationSelector.propTypes = {
  selectedDuration: PropTypes.string,
  onDurationSelect: PropTypes.func.isRequired
};

export default DurationSelector;