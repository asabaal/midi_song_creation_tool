import React, { useState } from 'react';
import { useSessionContext } from '../context/SessionContext';
import * as apiService from '../services/apiService';
import '../styles/PatternGenerator.css';

/**
 * PatternGenerator component - generates musical patterns like chords, basslines, and drums
 */
const PatternGenerator = () => {
  const { currentSession, selectedTrackId, setSelectedTrackId, addNotesToTrack } = useSessionContext();
  
  // State for UI tabs and forms
  const [activeTab, setActiveTab] = useState('chord');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewPattern, setPreviewPattern] = useState(null);
  
  // Form states for different pattern types
  const [chordParams, setChordParams] = useState({
    root: 'C',
    chordType: 'major',
    octave: 4,
    duration: 1
  });
  
  const [basslineParams, setBasslineParams] = useState({
    style: 'walking',
    roots: 'C G F C',
    octave: 2,
    bars: 4
  });
  
  const [drumParams, setDrumParams] = useState({
    style: 'basic',
    bars: 2,
    fill: false
  });
  
  // Handle track selection change
  const handleTrackChange = (e) => {
    setSelectedTrackId(parseInt(e.target.value));
  };
  
  // Handle chord parameter changes
  const handleChordParamChange = (e) => {
    const { name, value } = e.target;
    setChordParams({
      ...chordParams,
      [name]: name === 'octave' ? parseInt(value) : value
    });
  };
  
  // Handle bassline parameter changes
  const handleBasslineParamChange = (e) => {
    const { name, value } = e.target;
    setBasslineParams({
      ...basslineParams,
      [name]: name === 'octave' || name === 'bars' ? parseInt(value) : value
    });
  };
  
  // Handle drum parameter changes
  const handleDrumParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newValue = type === 'checkbox' ? checked : 
                    name === 'bars' ? parseInt(value) : value;
    
    setDrumParams({
      ...drumParams,
      [name]: newValue
    });
  };
  
  // Generate chord pattern
  const generateChordPattern = async (isPreview = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const patternParams = {
        type: 'chord',
        root: chordParams.root,
        chordType: chordParams.chordType,
        octave: chordParams.octave,
        duration: chordParams.duration,
        trackId: selectedTrackId
      };
      
      const result = await apiService.generatePattern(currentSession.id, patternParams);
      
      if (isPreview) {
        // For preview, just store the pattern for display
        setPreviewPattern(result);
      } else {
        // Add the notes to the track
        await addNotesToTrack(selectedTrackId, result.notes);
        setPreviewPattern(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate chord pattern');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate bassline pattern
  const generateBasslinePattern = async (isPreview = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const patternParams = {
        type: 'bassline',
        style: basslineParams.style,
        roots: basslineParams.roots.split(' '),
        octave: basslineParams.octave,
        bars: basslineParams.bars,
        trackId: selectedTrackId
      };
      
      const result = await apiService.generatePattern(currentSession.id, patternParams);
      
      if (isPreview) {
        setPreviewPattern(result);
      } else {
        await addNotesToTrack(selectedTrackId, result.notes);
        setPreviewPattern(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate bassline pattern');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate drum pattern
  const generateDrumPattern = async (isPreview = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const patternParams = {
        type: 'drum',
        style: drumParams.style,
        bars: drumParams.bars,
        fill: drumParams.fill,
        trackId: selectedTrackId
      };
      
      const result = await apiService.generatePattern(currentSession.id, patternParams);
      
      if (isPreview) {
        setPreviewPattern(result);
      } else {
        await addNotesToTrack(selectedTrackId, result.notes);
        setPreviewPattern(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate drum pattern');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert MIDI notes to readable note names
  const midiToNoteName = (midiNote) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  };
  
  // Format drum note names
  const formatDrumName = (midiNote) => {
    const drumMap = {
      36: 'Kick',
      38: 'Snare',
      42: 'Hi-Hat Closed',
      46: 'Hi-Hat Open',
      49: 'Crash',
      51: 'Ride',
      45: 'Tom 1',
      47: 'Tom 2',
      50: 'Tom 3'
    };
    
    return drumMap[midiNote] || `Note ${midiNote}`;
  };
  
  // Render preview of generated pattern
  const renderPreview = () => {
    if (!previewPattern || !previewPattern.notes) return null;
    
    const notesByBeat = {};
    
    // Group notes by start time
    previewPattern.notes.forEach(note => {
      const beat = note.startTime;
      if (!notesByBeat[beat]) {
        notesByBeat[beat] = [];
      }
      notesByBeat[beat].push(note);
    });
    
    // Sort beats
    const sortedBeats = Object.keys(notesByBeat).sort((a, b) => parseFloat(a) - parseFloat(b));
    
    return (
      <div className="pattern-preview" data-testid="pattern-preview">
        <h4>Pattern Preview</h4>
        <div className="preview-beats">
          {sortedBeats.map(beat => (
            <div key={beat} className="beat">
              <div className="beat-number">Beat {parseFloat(beat) + 1}</div>
              <div className="beat-notes">
                {notesByBeat[beat].map((note, i) => {
                  // Format note name based on pattern type
                  let noteName;
                  if (activeTab === 'drum') {
                    noteName = formatDrumName(note.pitch);
                  } else {
                    noteName = midiToNoteName(note.pitch);
                  }
                  
                  return (
                    <div key={i} className="note">
                      {noteName} ({note.velocity})
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => addNotesToTrack(selectedTrackId, previewPattern.notes)}
          disabled={isLoading}
        >
          Add to Track
        </button>
      </div>
    );
  };
  
  // Render the track selector
  const renderTrackSelector = () => {
    return (
      <div className="track-selector">
        <label>
          Target Track:
          <select 
            aria-label="Target Track"
            value={selectedTrackId} 
            onChange={handleTrackChange}
          >
            {currentSession.tracks.map(track => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };
  
  // Render chord pattern form
  const renderChordForm = () => {
    return (
      <div className="pattern-form">
        {renderTrackSelector()}
        
        <div className="form-row">
          <label>
            Root Note:
            <select 
              name="root"
              aria-label="Root Note"
              value={chordParams.root} 
              onChange={handleChordParamChange}
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </label>
          
          <label>
            Chord Type:
            <select 
              name="chordType"
              aria-label="Chord Type"
              value={chordParams.chordType} 
              onChange={handleChordParamChange}
            >
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="diminished">Diminished</option>
              <option value="augmented">Augmented</option>
              <option value="major7">Major 7th</option>
              <option value="minor7">Minor 7th</option>
              <option value="dominant7">Dominant 7th</option>
              <option value="sus2">Sus2</option>
              <option value="sus4">Sus4</option>
            </select>
          </label>
        </div>
        
        <div className="form-row">
          <label>
            Octave:
            <select 
              name="octave"
              aria-label="Octave"
              value={chordParams.octave} 
              onChange={handleChordParamChange}
            >
              {[2, 3, 4, 5, 6].map(octave => (
                <option key={octave} value={octave}>
                  {octave}
                </option>
              ))}
            </select>
          </label>
          
          <label>
            Duration:
            <select 
              name="duration"
              aria-label="Duration"
              value={chordParams.duration} 
              onChange={handleChordParamChange}
            >
              <option value="0.25">1/16 Note</option>
              <option value="0.5">1/8 Note</option>
              <option value="1">1/4 Note</option>
              <option value="2">1/2 Note</option>
              <option value="4">Whole Note</option>
            </select>
          </label>
        </div>
        
        <div className="form-buttons">
          <button 
            onClick={() => generateChordPattern(true)}
            disabled={isLoading}
          >
            Preview
          </button>
          
          <button 
            onClick={() => generateChordPattern(false)}
            disabled={isLoading}
          >
            Generate Chord
          </button>
        </div>
      </div>
    );
  };
  
  // Render bassline pattern form
  const renderBasslineForm = () => {
    return (
      <div className="pattern-form">
        {renderTrackSelector()}
        
        <div className="form-row">
          <label>
            Style:
            <select 
              name="style"
              aria-label="Style"
              value={basslineParams.style} 
              onChange={handleBasslineParamChange}
            >
              <option value="walking">Walking</option>
              <option value="pattern">Pattern</option>
              <option value="arpeggiated">Arpeggiated</option>
              <option value="groove">Groove</option>
            </select>
          </label>
          
          <label>
            Bars:
            <select 
              name="bars"
              aria-label="Bars"
              value={basslineParams.bars} 
              onChange={handleBasslineParamChange}
            >
              {[1, 2, 4, 8].map(bars => (
                <option key={bars} value={bars}>
                  {bars}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        <div className="form-row">
          <label className="full-width">
            Chord Roots:
            <input 
              type="text"
              name="roots"
              aria-label="Chord Roots"
              value={basslineParams.roots} 
              onChange={handleBasslineParamChange}
              placeholder="Enter roots separated by spaces (e.g., C G F C)"
            />
          </label>
        </div>
        
        <div className="form-buttons">
          <button 
            onClick={() => generateBasslinePattern(true)}
            disabled={isLoading}
          >
            Preview
          </button>
          
          <button 
            onClick={() => generateBasslinePattern(false)}
            disabled={isLoading}
          >
            Generate Bassline
          </button>
        </div>
      </div>
    );
  };
  
  // Render drum pattern form
  const renderDrumForm = () => {
    return (
      <div className="pattern-form">
        {renderTrackSelector()}
        
        <div className="form-row">
          <label>
            Style:
            <select 
              name="style"
              aria-label="Style"
              value={drumParams.style} 
              onChange={handleDrumParamChange}
            >
              <option value="basic">Basic</option>
              <option value="rock">Rock</option>
              <option value="jazz">Jazz</option>
              <option value="funk">Funk</option>
              <option value="electronic">Electronic</option>
            </select>
          </label>
          
          <label>
            Bars:
            <select 
              name="bars"
              aria-label="Bars"
              value={drumParams.bars} 
              onChange={handleDrumParamChange}
            >
              {[1, 2, 4, 8].map(bars => (
                <option key={bars} value={bars}>
                  {bars}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        <div className="form-row">
          <label className="checkbox-label">
            <input 
              type="checkbox"
              name="fill"
              checked={drumParams.fill} 
              onChange={handleDrumParamChange}
            />
            Add fill at the end
          </label>
        </div>
        
        <div className="form-buttons">
          <button 
            onClick={() => generateDrumPattern(true)}
            disabled={isLoading}
          >
            Preview
          </button>
          
          <button 
            onClick={() => generateDrumPattern(false)}
            disabled={isLoading}
          >
            Generate Drum Pattern
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="pattern-generator">
      <div className="pattern-tabs">
        <button 
          className={activeTab === 'chord' ? 'active' : ''}
          onClick={() => setActiveTab('chord')}
        >
          Chord Patterns
        </button>
        <button 
          className={activeTab === 'bassline' ? 'active' : ''}
          onClick={() => setActiveTab('bassline')}
        >
          Bassline Patterns
        </button>
        <button 
          className={activeTab === 'drum' ? 'active' : ''}
          onClick={() => setActiveTab('drum')}
        >
          Drum Patterns
        </button>
      </div>
      
      <div className="pattern-content">
        {activeTab === 'chord' && renderChordForm()}
        {activeTab === 'bassline' && renderBasslineForm()}
        {activeTab === 'drum' && renderDrumForm()}
        
        {isLoading && <div className="loading">Generating pattern...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {previewPattern && renderPreview()}
      </div>
    </div>
  );
};

export default PatternGenerator;