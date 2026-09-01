import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as chordProgressionService from '../../services/chordProgressionService';

// Tone.js is loaded as global script in index.html
// It will be available as window.Tone

/**
 * Playback Controls Component
 * 
 * Provides audio playback functionality for chord progressions using Tone.js
 * with play/pause, tempo control, and loop functionality.
 */
const PlaybackControls = ({ 
  progression, 
  isPlaying, 
  currentTime, 
  tempo, 
  loopEnabled, 
  onPlayStateChange, 
  onTimeUpdate, 
  onTempoChange, 
  onLoopToggle 
}) => {
  const [internalTempo, setInternalTempo] = useState(tempo);
  const [volume, setVolume] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  
  const synthRef = useRef(null);
  const sequenceRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Initialize Tone.js synth
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setIsLoading(true);
        
        // Check if Tone.js is loaded
        if (typeof window.Tone === 'undefined') {
          throw new Error('Tone.js library not loaded');
        }
        
        // Start Tone.js audio context
        await window.Tone.start();
        
        // Create a polyphonic synth with better settings for chords
        synthRef.current = new window.Tone.PolySynth(window.Tone.Synth, {
          oscillator: { 
            type: 'triangle' // Softer sound for chords
          },
          envelope: { 
            attack: 0.02,   // Quick attack
            decay: 0.1,     // Short decay
            sustain: 0.3,   // Moderate sustain
            release: 1      // Smooth release
          }
        }).connect(window.Tone.Destination);
        
        synthRef.current.volume.value = -20; // Default volume
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing audio:', error);
        setIsLoading(false);
      }
    };

    initializeAudio();

    // Cleanup
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Update synth volume
  useEffect(() => {
    if (synthRef.current) {
      // Convert volume percentage to decibels
      const dbValue = -40 + (volume / 100) * 40; // Range: -40dB to 0dB
      synthRef.current.volume.value = dbValue;
    }
  }, [volume]);

  // Update tempo
  useEffect(() => {
    setInternalTempo(tempo);
    if (typeof window.Tone !== 'undefined' && window.Tone.Transport) {
      window.Tone.Transport.bpm.value = tempo;
    }
  }, [tempo]);

  // Check if Tone.js is loaded
  useEffect(() => {
    if (typeof window.Tone === 'undefined') {
      console.error('Tone.js library not loaded. Check if CDN script is working.');
      setIsLoading(true);
    }
  }, []);

  // Convert beats to Tone.js notation
  const beatsToToneNotation = (beats) => {
    if (beats === 4) return '1n';    // Whole note
    if (beats === 2) return '2n';    // Half note
    if (beats === 1) return '4n';    // Quarter note
    if (beats === 0.5) return '8n';   // Eighth note
    if (beats === 0.25) return '16n'; // Sixteenth note
    return `${beats}n`; // Custom duration
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (isLoading || progression.length === 0) return;

    try {
      if (isPlaying) {
        // Stop playback
        if (sequenceRef.current) {
          sequenceRef.current.stop();
        }
        if (typeof window.Tone !== 'undefined' && window.Tone.Transport) {
          window.Tone.Transport.stop();
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        onPlayStateChange(false);
        setCurrentChordIndex(-1);
      } else {
        // Start playback
        await startPlayback();
        onPlayStateChange(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Start playback
  const startPlayback = async () => {
    if (!synthRef.current || progression.length === 0) return;

    // Create chord sequence with proper timing
    const chordEvents = progression.map((chord, index) => {
      const startTime = chord.startTime || 0;
      const duration = chord.durationInBeats || 1;
      
      return {
        time: startTime, // Tone.js Sequence handles beat timing correctly
        chord: chord.midiNotes,
        duration: beatsToToneNotation(duration),
        index: index
      };
    });

    // Create and start sequence with proper subdivision
    sequenceRef.current = new window.Tone.Sequence((time, event) => {
      // Play the chord
      if (event.chord && event.chord.length > 0) {
        synthRef.current.triggerAttackRelease(event.chord, event.duration, time);
        setCurrentChordIndex(event.index);
      }
    }, chordEvents, '4n'); // Use quarter note as base unit for timing resolution

    // Set up transport
    window.Tone.Transport.bpm.value = internalTempo;
    
    if (loopEnabled) {
      const totalDuration = chordProgressionService.calculateProgressionDuration(progression, internalTempo).totalBeats;
      window.Tone.Transport.loop = true;
      window.Tone.Transport.loopEnd = `${totalDuration}m`;
    } else {
      window.Tone.Transport.loop = false;
    }

    // Start progress tracking
    let startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const beats = (elapsed * internalTempo) / 60;
      onTimeUpdate(beats);
    }, 100);

    // Start everything
    window.Tone.Transport.start();
    sequenceRef.current.start(0);
  };

  // Stop playback
  const handleStop = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
    }
    if (typeof window.Tone !== 'undefined' && window.Tone.Transport) {
      window.Tone.Transport.stop();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    onPlayStateChange(false);
    setCurrentChordIndex(-1);
    onTimeUpdate(0);
  };

  // Handle tempo change
  const handleTempoChange = (newTempo) => {
    setInternalTempo(newTempo);
    onTempoChange(newTempo);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  // Skip to previous chord
  const handlePrevious = () => {
    if (currentChordIndex > 0) {
      const targetIndex = currentChordIndex - 1;
      const targetChord = progression[targetIndex];
      if (targetChord) {
        onTimeUpdate(targetChord.startTime || 0);
        setCurrentChordIndex(targetIndex);
      }
    }
  };

  // Skip to next chord
  const handleNext = () => {
    if (currentChordIndex < progression.length - 1) {
      const targetIndex = currentChordIndex + 1;
      const targetChord = progression[targetIndex];
      if (targetChord) {
        onTimeUpdate(targetChord.startTime || 0);
        setCurrentChordIndex(targetIndex);
      }
    }
  };

  // Format time display
  const formatTime = (beats) => {
    const seconds = (beats / internalTempo) * 60;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate total duration
  const totalDuration = chordProgressionService.calculateProgressionDuration(progression, internalTempo);
  const progressPercentage = totalDuration.totalBeats > 0 
    ? (currentTime / totalDuration.totalBeats) * 100 
    : 0;

  return (
    <div className="playback-controls">
      <div className="section-header">
        <h3 className="section-title">Playback Controls</h3>
        {isLoading && <div className="loading-small"></div>}
      </div>

      {typeof window.Tone === 'undefined' ? (
        <div className="no-progression">
          <p>Loading audio library...</p>
          <p>If this persists, please refresh the page.</p>
        </div>
      ) : progression.length === 0 ? (
        <div className="no-progression">
          <p>Add chords to the progression to enable playback</p>
        </div>
      ) : (
        <div className="playback-content">
          {/* Main Controls */}
          <div className="main-controls">
            <div className="transport-controls">
              <button
                onClick={handlePrevious}
                disabled={currentChordIndex <= 0 || !isPlaying}
                className="btn btn-secondary"
                title="Previous chord"
              >
                ⏮️
              </button>
              
              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className={`btn ${isPlaying ? 'btn-danger' : 'btn-success'} btn-large`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button
                onClick={handleStop}
                disabled={!isPlaying}
                className="btn btn-secondary"
                title="Stop"
              >
                ⏹️
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentChordIndex >= progression.length - 1 || !isPlaying}
                className="btn btn-secondary"
                title="Next chord"
              >
                ⏭️
              </button>
            </div>

            {/* Loop Control */}
            <div className="loop-control">
              <button
                onClick={onLoopToggle}
                className={`btn btn-small ${loopEnabled ? 'btn-primary' : 'btn-secondary'}`}
                title={loopEnabled ? 'Disable loop' : 'Enable loop'}
              >
                {loopEnabled ? '🔁 Loop On' : '🔁 Loop Off'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-info">
              <span className="current-time">{formatTime(currentTime)}</span>
              <span className="total-time">{totalDuration.formattedTime}</span>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Current Chord Display */}
            {currentChordIndex >= 0 && currentChordIndex < progression.length && (
              <div className="current-chord-display">
                <span className="current-label">Playing:</span>
                <span className="current-chord-name">
                  {progression[currentChordIndex].name}
                </span>
                {progression[currentChordIndex].function && (
                  <span className="current-chord-function">
                    ({progression[currentChordIndex].function})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tempo and Volume Controls */}
          <div className="audio-controls">
            <div className="tempo-control">
              <label className="control-label">
                Tempo: {internalTempo} BPM
              </label>
              <input
                type="range"
                min="40"
                max="200"
                value={internalTempo}
                onChange={(e) => handleTempoChange(parseInt(e.target.value))}
                className="slider"
                disabled={isPlaying}
              />
              <div className="tempo-presets">
                <button
                  onClick={() => handleTempoChange(60)}
                  disabled={isPlaying}
                  className="btn btn-small btn-secondary"
                >
                  60
                </button>
                <button
                  onClick={() => handleTempoChange(120)}
                  disabled={isPlaying}
                  className="btn btn-small btn-secondary"
                >
                  120
                </button>
                <button
                  onClick={() => handleTempoChange(140)}
                  disabled={isPlaying}
                  className="btn btn-small btn-secondary"
                >
                  140
                </button>
              </div>
            </div>

            <div className="volume-control">
              <label className="control-label">
                Volume: {volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="slider"
              />
              <div className="volume-icons">
                <span className="volume-icon">🔇</span>
                <span className="volume-icon">🔉</span>
                <span className="volume-icon">🔊</span>
              </div>
            </div>
          </div>

          {/* Audio Status */}
          <div className="audio-status">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value ${isPlaying ? 'playing' : 'stopped'}`}>
                {isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Stopped'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Chords:</span>
              <span className="status-value">{progression.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Loop:</span>
              <span className="status-value">{loopEnabled ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PlaybackControls.propTypes = {
  progression: PropTypes.array.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
  tempo: PropTypes.number.isRequired,
  loopEnabled: PropTypes.bool.isRequired,
  onPlayStateChange: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func.isRequired,
  onTempoChange: PropTypes.func.isRequired,
  onLoopToggle: PropTypes.func.isRequired
};

export default PlaybackControls;