import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ChordSelector from './ChordSelector';
import DurationSelector from './DurationSelector';
import ProgressionTimeline from './ProgressionTimeline';
import CustomChordBuilder from './CustomChordBuilder';
import * as chordProgressionService from '../../services/chordProgressionService';

/**
 * Progression Builder Component
 * 
 * Main interface for building chord progressions with timeline visualization,
 * chord selection, and custom chord creation.
 */
const ProgressionBuilder = ({ 
  selectedKey, 
  diatonicChords, 
  customChords, 
  progression, 
  onAddChord, 
  onUpdateChord, 
  onRemoveChord, 
  onReorderChords, 
  onCustomChordCreated,
  tempo 
}) => {
  const [selectedChord, setSelectedChord] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [editingChord, setEditingChord] = useState(null);

  // Handle chord selection from chord selector
  const handleChordSelect = (chord) => {
    setSelectedChord(chord);
    setEditingChord(null);
  };

  // Handle duration selection
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  // Add chord to progression
  const handleAddChord = () => {
    if (!selectedChord) {
      alert('Please select a chord first');
      return;
    }

    const chordData = {
      name: selectedChord.name,
      root: selectedChord.root,
      type: selectedChord.type,
      notes: selectedChord.notes,
      midiNotes: selectedChord.midiNotes,
      duration: selectedDuration,
      durationInBeats: chordProgressionService.calculateProgressionDuration([{ duration: selectedDuration }], tempo).totalBeats,
      isCustom: selectedChord.isCustom || false,
      function: selectedChord.function
    };

    onAddChord(chordData);
    
    // Reset selection
    setSelectedChord(null);
  };

  // Handle editing existing chord
  const handleEditChord = (chord) => {
    setEditingChord(chord);
    setSelectedChord(chord);
    setSelectedDuration(chord.duration);
  };

  // Update edited chord
  const handleUpdateChord = () => {
    if (!editingChord || !selectedChord) return;

    const updatedChord = {
      ...editingChord,
      name: selectedChord.name,
      root: selectedChord.root,
      type: selectedChord.type,
      notes: selectedChord.notes,
      midiNotes: selectedChord.midiNotes,
      duration: selectedDuration,
      durationInBeats: chordProgressionService.calculateProgressionDuration([{ duration: selectedDuration }], tempo).totalBeats,
      isCustom: selectedChord.isCustom || false,
      function: selectedChord.function
    };

    onUpdateChord(editingChord.id, updatedChord);
    
    // Reset editing state
    setEditingChord(null);
    setSelectedChord(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingChord(null);
    setSelectedChord(null);
  };

  // Handle custom chord creation
  const handleCustomChordCreated = (customChord) => {
    onCustomChordCreated(customChord);
    setShowCustomBuilder(false);
    
    // Auto-select the new custom chord
    setSelectedChord(customChord);
  };

  // Clear progression
  const handleClearProgression = () => {
    if (progression.length === 0) return;
    
    if (confirm('Are you sure you want to clear the entire progression?')) {
      // Remove all chords by calling onRemoveChord for each
      progression.forEach(chord => {
        onRemoveChord(chord.id);
      });
    }
  };

  return (
    <div className="progression-builder">
      <div className="section-header">
        <h3 className="section-title">Progression Builder</h3>
        <div className="builder-actions">
          {progression.length > 0 && (
            <button onClick={handleClearProgression} className="btn btn-small btn-danger">
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowCustomBuilder(!showCustomBuilder)}
            className={`btn btn-small ${showCustomBuilder ? 'btn-secondary' : ''}`}
          >
            {showCustomBuilder ? 'Hide' : 'Create'} Custom Chord
          </button>
        </div>
      </div>

      {/* Progression Timeline */}
      <div className="timeline-section">
        <ProgressionTimeline
          progression={progression}
          tempo={tempo}
          onEditChord={handleEditChord}
          onRemoveChord={onRemoveChord}
          onReorderChords={onReorderChords}
        />
      </div>

      {/* Chord Selection Controls */}
      <div className="chord-controls-section">
        <div className="control-row">
          <div className="control-group">
            <label className="control-label">Select Chord:</label>
            <ChordSelector
              selectedKey={selectedKey}
              diatonicChords={diatonicChords}
              customChords={customChords}
              selectedChord={selectedChord}
              onChordSelect={handleChordSelect}
            />
          </div>

          <div className="control-group">
            <label className="control-label">Duration:</label>
            <DurationSelector
              selectedDuration={selectedDuration}
              onDurationSelect={handleDurationSelect}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {editingChord ? (
            <div className="edit-actions">
              <button onClick={handleUpdateChord} className="btn btn-success">
                Update Chord
              </button>
              <button onClick={handleCancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddChord} 
              disabled={!selectedChord}
              className="btn btn-primary"
            >
              Add to Progression
            </button>
          )}
        </div>

        {/* Current Selection Display */}
        {selectedChord && (
          <div className="current-selection">
            <div className="selection-info">
              <span className="selection-label">Current Selection:</span>
              <div className="selection-details">
                <span className="chord-name">{selectedChord.name}</span>
                {selectedChord.function && (
                  <span className="chord-function">({selectedChord.function})</span>
                )}
                <span className="chord-duration">
                  {chordProgressionService.formatDuration(selectedDuration)}
                </span>
              </div>
            </div>
            {selectedChord.notes && (
              <div className="selection-notes">
                <span className="notes-label">Notes:</span>
                <span className="notes-list">
                  {selectedChord.notes.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Chord Builder */}
      {showCustomBuilder && (
        <div className="custom-builder-section">
          <CustomChordBuilder
            onChordCreated={handleCustomChordCreated}
            isVisible={showCustomBuilder}
          />
        </div>
      )}

      {/* Progression Statistics */}
      {progression.length > 0 && (
        <div className="progression-stats">
          <h4>Progression Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Chords:</span>
              <span className="stat-value">{progression.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Duration:</span>
              <span className="stat-value">
                {chordProgressionService.calculateProgressionDuration(progression, tempo).formattedTime}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Custom Chords:</span>
              <span className="stat-value">
                {progression.filter(chord => chord.isCustom).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProgressionBuilder.propTypes = {
  selectedKey: PropTypes.string.isRequired,
  diatonicChords: PropTypes.array.isRequired,
  customChords: PropTypes.array.isRequired,
  progression: PropTypes.array.isRequired,
  onAddChord: PropTypes.func.isRequired,
  onUpdateChord: PropTypes.func.isRequired,
  onRemoveChord: PropTypes.func.isRequired,
  onReorderChords: PropTypes.func.isRequired,
  onCustomChordCreated: PropTypes.func.isRequired,
  tempo: PropTypes.number.isRequired
};

export default ProgressionBuilder;