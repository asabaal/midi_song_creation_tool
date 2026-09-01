import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Chord Selector Component
 * 
 * Provides interface for selecting from diatonic chords, custom chords,
 * and common chord extensions.
 */
const ChordSelector = ({ 
  selectedKey, 
  diatonicChords, 
  customChords, 
  selectedChord, 
  onChordSelect 
}) => {
  const [activeTab, setActiveTab] = useState('diatonic');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chords based on search term
  const filterChords = (chords) => {
    if (!searchTerm) return chords;
    
    const lowerSearch = searchTerm.toLowerCase();
    return chords.filter(chord => 
      chord.name.toLowerCase().includes(lowerSearch) ||
      (chord.function && chord.function.toLowerCase().includes(lowerSearch)) ||
      (chord.type && chord.type.toLowerCase().includes(lowerSearch))
    );
  };

  // Common chord extensions
  const commonExtensions = [
    { name: 'major7', type: 'major7', description: 'Major 7th' },
    { name: 'minor7', type: 'minor7', description: 'Minor 7th' },
    { name: 'dominant7', type: 'dominant7', description: 'Dominant 7th' },
    { name: 'sus4', type: 'sus4', description: 'Suspended 4th' },
    { name: 'sus2', type: 'sus2', description: 'Suspended 2nd' },
    { name: 'dim', type: 'diminished', description: 'Diminished' },
    { name: 'aug', type: 'augmented', description: 'Augmented' }
  ];

  // Get root note from selected key
  const getRootNote = () => {
    return selectedKey.split(' ')[0];
  };

  // Generate extended chords for the current key
  const generateExtendedChords = () => {
    const root = getRootNote();
    return commonExtensions.map(ext => ({
      name: `${root} ${ext.name}`,
      root: root,
      type: ext.type,
      description: ext.description,
      isExtension: true
    }));
  };

  // Handle chord selection
  const handleChordClick = (chord) => {
    onChordSelect(chord);
  };

  // Render chord button
  const renderChordButton = (chord, index) => {
    const isSelected = selectedChord && (
      selectedChord.name === chord.name ||
      (selectedChord.id && selectedChord.id === chord.id)
    );

    return (
      <button
        key={index}
        onClick={() => handleChordClick(chord)}
        className={`chord-button ${isSelected ? 'selected' : ''} ${
          chord.isCustom ? 'custom' : ''
        } ${chord.isExtension ? 'extension' : ''}`}
        title={chord.description || chord.name}
      >
        <div className="chord-name">{chord.name}</div>
        {chord.function && (
          <div className="chord-function">{chord.function}</div>
        )}
        {chord.isCustom && (
          <div className="chord-indicator">Custom</div>
        )}
        {chord.isExtension && (
          <div className="chord-indicator">Extension</div>
        )}
      </button>
    );
  };

  const filteredDiatonicChords = filterChords(diatonicChords);
  const filteredCustomChords = filterChords(customChords);
  const extendedChords = generateExtendedChords();
  const filteredExtendedChords = filterChords(extendedChords);

  return (
    <div className="chord-selector">
      {/* Search Bar */}
      <div className="chord-search">
        <input
          type="text"
          placeholder="Search chords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="clear-search"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="chord-tabs">
        <button
          className={`tab-button ${activeTab === 'diatonic' ? 'active' : ''}`}
          onClick={() => setActiveTab('diatonic')}
        >
          Diatonic ({diatonicChords.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'extensions' ? 'active' : ''}`}
          onClick={() => setActiveTab('extensions')}
        >
          Extensions ({extendedChords.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom ({customChords.length})
        </button>
      </div>

      {/* Chord Lists */}
      <div className="chord-lists">
        {/* Diatonic Chords */}
        {activeTab === 'diatonic' && (
          <div className="chord-list">
            {filteredDiatonicChords.length === 0 ? (
              <div className="no-chords">
                {searchTerm ? 'No diatonic chords found' : 'Loading diatonic chords...'}
              </div>
            ) : (
              <div className="chord-grid">
                {filteredDiatonicChords.map(renderChordButton)}
              </div>
            )}
          </div>
        )}

        {/* Extended Chords */}
        {activeTab === 'extensions' && (
          <div className="chord-list">
            {filteredExtendedChords.length === 0 ? (
              <div className="no-chords">
                {searchTerm ? 'No extensions found' : 'No extensions available'}
              </div>
            ) : (
              <div className="chord-grid">
                {filteredExtendedChords.map(renderChordButton)}
              </div>
            )}
          </div>
        )}

        {/* Custom Chords */}
        {activeTab === 'custom' && (
          <div className="chord-list">
            {filteredCustomChords.length === 0 ? (
              <div className="no-chords">
                {searchTerm ? 'No custom chords found' : (
                  <div className="empty-custom">
                    <p>No custom chords yet</p>
                    <p>Use the "Create Custom Chord" button to build your own chords</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="chord-grid">
                {filteredCustomChords.map(renderChordButton)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Chord Display */}
      {selectedChord && (
        <div className="selected-chord-display">
          <div className="selected-info">
            <span className="selected-label">Selected:</span>
            <span className="selected-name">{selectedChord.name}</span>
            {selectedChord.function && (
              <span className="selected-function">({selectedChord.function})</span>
            )}
          </div>
          {selectedChord.notes && (
            <div className="selected-notes">
              <span className="notes-label">Notes:</span>
              <span className="notes-text">{selectedChord.notes.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ChordSelector.propTypes = {
  selectedKey: PropTypes.string.isRequired,
  diatonicChords: PropTypes.array.isRequired,
  customChords: PropTypes.array.isRequired,
  selectedChord: PropTypes.object,
  onChordSelect: PropTypes.func.isRequired
};

export default ChordSelector;