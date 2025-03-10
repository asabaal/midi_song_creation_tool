import React, { useState, useEffect } from 'react';
import { useSessionContext } from '../context/SessionContext';
import * as transportService from '../services/transportService';
import '../styles/TransportControls.css';

/**
 * TransportControls component - provides play, pause, stop, and other transport controls
 */
const TransportControls = () => {
  const { currentSession, updateTransport } = useSessionContext();
  const [isRecording, setIsRecording] = useState(false);
  const [positionTick, setPositionTick] = useState(0);
  const [bpmValue, setBpmValue] = useState(currentSession.bpm || 120);
  
  // Subscribe to transport position updates
  useEffect(() => {
    const handleTick = (tick) => {
      setPositionTick(tick);
    };
    
    transportService.subscribeToTick(handleTick);
    
    return () => {
      transportService.unsubscribeFromTick(handleTick);
    };
  }, []);
  
  // Check if transport is playing
  const isPlaying = transportService.isPlaying();
  
  // Format position tick to "bar.beat.tick" format
  const formatPosition = (tick) => {
    const ppq = 480; // Ticks per quarter note
    const beatsPerBar = currentSession.timeSignature?.[0] || 4;
    
    const totalBeats = Math.floor(tick / ppq);
    const bars = Math.floor(totalBeats / beatsPerBar) + 1; // 1-based
    const beats = (totalBeats % beatsPerBar) + 1; // 1-based
    const ticks = Math.floor((tick % ppq) / (ppq / 100)); // 0-99
    
    return `${bars}.${beats}.${ticks.toString().padStart(2, '0')}`;
  };
  
  // Handle BPM change
  const handleBpmChange = (e) => {
    setBpmValue(e.target.value);
  };
  
  // Apply BPM change on blur
  const handleBpmBlur = () => {
    // Clamp BPM to valid range (40-240)
    const newBpm = Math.min(240, Math.max(40, parseInt(bpmValue) || 120));
    setBpmValue(newBpm);
    
    updateTransport({ bpm: newBpm });
    transportService.setBpm(newBpm);
  };
  
  // Handle time signature change
  const handleTimeSignatureChange = (e) => {
    const [numerator, denominator] = e.target.value.split('/').map(num => parseInt(num));
    updateTransport({ timeSignature: [numerator, denominator] });
  };
  
  // Toggle recording mode
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  // Toggle loop mode
  const toggleLoop = () => {
    const currentLoop = currentSession.loop || { enabled: false, start: 0, end: 16 };
    updateTransport({
      loop: {
        ...currentLoop,
        enabled: !currentLoop.enabled
      }
    });
  };
  
  return (
    <div className="transport-controls">
      <div className="transport-main">
        {/* Play/Pause Button */}
        <button
          className={`transport-button ${isPlaying ? 'active' : ''}`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={() => isPlaying ? transportService.pause() : transportService.play()}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        {/* Stop Button */}
        <button
          className="transport-button"
          aria-label="Stop"
          onClick={() => transportService.stop()}
        >
          ⏹
        </button>
        
        {/* Record Button */}
        <button
          className={`transport-button ${isRecording ? 'active' : ''}`}
          aria-label="Record"
          onClick={toggleRecording}
        >
          ⚫
        </button>
        
        {/* Loop Button */}
        <button
          className={`transport-button ${currentSession.loop?.enabled ? 'active' : ''}`}
          aria-label="Loop"
          onClick={toggleLoop}
        >
          🔄
        </button>
      </div>
      
      {/* Position Display */}
      <div className="position-display" data-testid="position-display">
        {formatPosition(positionTick)}
      </div>
      
      {/* BPM Control */}
      <div className="transport-settings">
        <label>
          <span>BPM</span>
          <input
            type="number"
            aria-label="BPM"
            value={bpmValue}
            onChange={handleBpmChange}
            onBlur={handleBpmBlur}
            min="40"
            max="240"
          />
        </label>
        
        {/* Time Signature Selector */}
        <label>
          <span>Time Signature</span>
          <select
            aria-label="Time Signature"
            value={`${currentSession.timeSignature?.[0]}/${currentSession.timeSignature?.[1]}`}
            onChange={handleTimeSignatureChange}
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
            <option value="2/4">2/4</option>
            <option value="5/4">5/4</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default TransportControls;