import React, { useState, useEffect } from 'react';
import KeySelector from './KeySelector';
import ProgressionBuilder from './ProgressionBuilder';
import PlaybackControls from './PlaybackControls';
import ExportControls from './ExportControls';
import * as chordProgressionService from '../../services/chordProgressionService';
import '../../styles/ChordProgressionExplorer.css';

/**
 * Main Chord Progression Explorer Component
 * 
 * Provides a complete interface for creating, exploring, and exporting chord progressions
 * with support for custom chord creation and real-time playback.
 */
const ChordProgressionExplorer = () => {
  const [selectedKey, setSelectedKey] = useState('C major');
  const [progression, setProgression] = useState([]);
  const [diatonicChords, setDiatonicChords] = useState([]);
  const [customChords, setCustomChords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load diatonic chords when key changes
  useEffect(() => {
    const loadDiatonicChords = async () => {
      try {
        setLoading(true);
        setError(null);
        const chords = await chordProgressionService.getDiatonicChords(selectedKey);
        setDiatonicChords(chords.chords || []);
      } catch (err) {
        setError('Failed to load diatonic chords');
        console.error('Error loading diatonic chords:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDiatonicChords();
  }, [selectedKey]);

  // Handle key change
  const handleKeyChange = (newKey) => {
    setSelectedKey(newKey);
    // Clear progression when key changes to avoid conflicts
    setProgression([]);
  };

  // Handle adding chord to progression
  const handleAddChord = (chordData) => {
    const newChord = {
      ...chordData,
      id: Date.now(), // Simple unique ID
      startTime: progression.reduce((sum, chord) => sum + (chord.durationInBeats || 1), 0)
    };
    setProgression([...progression, newChord]);
  };

  // Handle updating chord in progression
  const handleUpdateChord = (chordId, updates) => {
    setProgression(progression.map(chord => 
      chord.id === chordId ? { ...chord, ...updates } : chord
    ));
  };

  // Handle removing chord from progression
  const handleRemoveChord = (chordId) => {
    setProgression(progression.filter(chord => chord.id !== chordId));
  };

  // Handle reordering chords
  const handleReorderChords = (fromIndex, toIndex) => {
    const reorderedProgression = [...progression];
    const [movedChord] = reorderedProgression.splice(fromIndex, 1);
    reorderedProgression.splice(toIndex, 0, movedChord);
    
    // Recalculate start times
    let currentTime = 0;
    reorderedProgression.forEach(chord => {
      chord.startTime = currentTime;
      currentTime += chord.durationInBeats || 1;
    });
    
    setProgression(reorderedProgression);
  };

  // Handle custom chord creation
  const handleCustomChordCreated = (customChord) => {
    setCustomChords([...customChords, { ...customChord, id: Date.now() }]);
  };

  // Handle playback state changes
  const handlePlayStateChange = (playing) => {
    setIsPlaying(playing);
  };

  // Handle time updates during playback
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  // Handle tempo changes
  const handleTempoChange = (newTempo) => {
    setTempo(newTempo);
  };

  // Handle loop toggle
  const handleLoopToggle = () => {
    setLoopEnabled(!loopEnabled);
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  return (
    <div className="chord-progression-explorer">
      <header className="explorer-header">
        <h2>Chord Progression Explorer</h2>
        <p className="explorer-subtitle">
          Create, explore, and export chord progressions with custom chord support
        </p>
      </header>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={clearError} className="close-error">×</button>
        </div>
      )}

      <div className="explorer-content">
        {/* Key Selection Section */}
        <section className="key-section">
          <KeySelector 
            selectedKey={selectedKey}
            onKeyChange={handleKeyChange}
            loading={loading}
          />
        </section>

        {/* Progression Builder Section */}
        <section className="progression-builder-section">
          <ProgressionBuilder 
            key={selectedKey} // Force re-render when key changes
            selectedKey={selectedKey}
            diatonicChords={diatonicChords}
            customChords={customChords}
            progression={progression}
            onAddChord={handleAddChord}
            onUpdateChord={handleUpdateChord}
            onRemoveChord={handleRemoveChord}
            onReorderChords={handleReorderChords}
            onCustomChordCreated={handleCustomChordCreated}
            tempo={tempo}
          />
        </section>

        {/* Playback Controls Section */}
        <section className="playback-section">
          <PlaybackControls 
            progression={progression}
            isPlaying={isPlaying}
            currentTime={currentTime}
            tempo={tempo}
            loopEnabled={loopEnabled}
            onPlayStateChange={handlePlayStateChange}
            onTimeUpdate={handleTimeUpdate}
            onTempoChange={handleTempoChange}
            onLoopToggle={handleLoopToggle}
          />
        </section>

        {/* Export Controls Section */}
        <section className="export-section">
          <ExportControls 
            progression={progression}
            selectedKey={selectedKey}
            tempo={tempo}
          />
        </section>
      </div>

      {/* Status Bar */}
      <footer className="explorer-status">
        <div className="status-info">
          <span>Key: {selectedKey}</span>
          <span>•</span>
          <span>Chords: {progression.length}</span>
          <span>•</span>
          <span>Tempo: {tempo} BPM</span>
          {progression.length > 0 && (
            <>
              <span>•</span>
              <span>
                Duration: {Math.ceil(progression.reduce((sum, chord) => 
                  sum + (chord.durationInBeats || 1), 0
                ) * 60 / tempo)}s
              </span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ChordProgressionExplorer;