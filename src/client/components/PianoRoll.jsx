import React, { useState, useEffect, useRef } from 'react';
import { useSessionContext } from '../context/SessionContext';
import '../styles/PianoRoll.css';

/**
 * PianoRoll component - displays and edits MIDI notes in a piano roll format
 */
const PianoRoll = () => {
  const { 
    currentSession, 
    addNote, 
    updateNote, 
    deleteNote, 
    selectedTrackId, 
    setSelectedTrackId,
    forceRefresh 
  } = useSessionContext();

  // DEBUG: Add detailed logging for component mounting and data flow
  useEffect(() => {
    console.log("PianoRoll DEBUG - Component rendering with props:", {
      currentSession: currentSession?.id,
      selectedTrackId,
      tracksAvailable: currentSession?.tracks?.length || 0
    });
    
    // Find the currently selected track
    const currentTrack = currentSession?.tracks?.find(t => t.id === selectedTrackId);
    console.log("PianoRoll DEBUG - Selected track:", {
      id: currentTrack?.id,
      name: currentTrack?.name,
      noteCount: currentTrack?.notes?.length || 0,
      firstFewNotes: currentTrack?.notes?.slice(0, 3)
    });
  }, [currentSession, selectedTrackId]);

  // Refs for canvas elements
  const pianoKeysRef = useRef(null);
  const noteGridRef = useRef(null);
  
  // State for UI interactions
  const [selectedNote, setSelectedNote] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [quantizeValue, setQuantizeValue] = useState('0.25');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Get the current track - ENHANCED with fallback logic and error prevention
  const getCurrentTrack = () => {
    // First try to find the selected track
    if (selectedTrackId && currentSession?.tracks) {
      const track = currentSession.tracks.find(t => t.id === selectedTrackId);
      if (track) return track;
    }
    
    // If no selected track or it doesn't exist, find any track with notes
    if (currentSession?.tracks && currentSession.tracks.length > 0) {
      const trackWithNotes = currentSession.tracks.find(t => t.notes && t.notes.length > 0);
      if (trackWithNotes) {
        // Auto-select this track
        console.log(`PianoRoll DEBUG - Auto-selecting track with notes: ${trackWithNotes.id}`);
        setSelectedTrackId(trackWithNotes.id);
        return trackWithNotes;
      }
      
      // If no track has notes, just return the first track
      return currentSession.tracks[0];
    }
    
    // Fallback to an empty track
    return { id: 0, name: 'Default', notes: [] };
  };
  
  const currentTrack = getCurrentTrack();
  
  // DEBUG: Log whenever the current track changes
  useEffect(() => {
    console.log("PianoRoll DEBUG - Current track updated:", {
      id: currentTrack?.id,
      name: currentTrack?.name,
      noteCount: currentTrack?.notes?.length || 0
    });
  }, [currentTrack]);
  
  // Constants for rendering
  const NOTE_HEIGHT = 20;
  const BEATS_TO_SHOW = 16;
  const GRID_WIDTH = 800;
  const PIXELS_PER_BEAT = GRID_WIDTH / BEATS_TO_SHOW;
  
  // Initialize and draw piano keys
  useEffect(() => {
    const drawPianoKeys = () => {
      const canvas = pianoKeysRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Draw piano keys (white keys as background)
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      
      // Draw lines between keys
      context.strokeStyle = '#cccccc';
      context.lineWidth = 1;
      
      for (let i = 0; i < 88; i++) {
        const y = i * NOTE_HEIGHT;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
        
        // Draw note names for C notes
        const noteNumber = 108 - i; // Highest note is A0 (MIDI 21)
        if (noteNumber % 12 === 0) {
          context.fillStyle = '#000000';
          context.font = '10px Arial';
          context.fillText(`C${Math.floor(noteNumber / 12)}`, 5, y + 12);
        }
      }
      
      // Draw black keys
      for (let i = 0; i < 88; i++) {
        const noteNumber = 108 - i;
        const octave = Math.floor(noteNumber / 12);
        const note = noteNumber % 12;
        
        // Black keys are at positions 1, 3, 6, 8, 10 (C# D# F# G# A#)
        if ([1, 3, 6, 8, 10].includes(note)) {
          context.fillStyle = '#333333';
          context.fillRect(0, i * NOTE_HEIGHT, width * 0.6, NOTE_HEIGHT);
        }
      }
    };
    
    drawPianoKeys();
  }, []);
  
  // Draw note grid with notes
  useEffect(() => {
    const drawNoteGrid = () => {
      const canvas = noteGridRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#f5f5f5';
      context.fillRect(0, 0, width, height);
      
      // Draw vertical grid lines (beats)
      context.strokeStyle = '#dddddd';
      context.lineWidth = 1;
      
      for (let i = 0; i <= BEATS_TO_SHOW; i++) {
        const x = i * PIXELS_PER_BEAT * zoomLevel;
        
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        
        // Make beat lines darker
        if (i % 4 === 0) {
          context.strokeStyle = '#aaaaaa';
        } else {
          context.strokeStyle = '#dddddd';
        }
        
        context.stroke();
      }
      
      // Draw horizontal grid lines (notes)
      for (let i = 0; i < 88; i++) {
        const y = i * NOTE_HEIGHT;
        
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.strokeStyle = '#dddddd';
        context.stroke();
      }
      
      // DEBUG: Log note rendering
      console.log("PianoRoll DEBUG - Attempting to draw notes:", {
        currentTrackExists: !!currentTrack,
        notesExist: !!(currentTrack && currentTrack.notes),
        noteCount: currentTrack?.notes?.length || 0
      });
      
      // ENHANCED: Check both currentTrack and its notes array before trying to use
      if (currentTrack && Array.isArray(currentTrack.notes) && currentTrack.notes.length > 0) {
        console.log("PianoRoll DEBUG - Found notes to draw:", {
          trackId: currentTrack.id,
          noteCount: currentTrack.notes.length,
          sampleNotes: currentTrack.notes.slice(0, 3)
        });
        
        // Draw notes
        currentTrack.notes.forEach(note => {
          const x = note.startTime * PIXELS_PER_BEAT * zoomLevel;
          const width = note.duration * PIXELS_PER_BEAT * zoomLevel;
          const y = (108 - note.pitch) * NOTE_HEIGHT; // Convert MIDI pitch to y position
          
          // DEBUG: Log each note being drawn
          console.log("PianoRoll DEBUG - Drawing note:", {
            id: note.id,
            pitch: note.pitch,
            startTime: note.startTime,
            duration: note.duration,
            x, y, width, height: NOTE_HEIGHT
          });
          
          // Draw note rectangle
          context.fillStyle = note.id === selectedNote?.id ? '#ff7700' : '#4285f4';
          context.fillRect(x, y, width, NOTE_HEIGHT);
          
          // Draw note border
          context.strokeStyle = '#2c3e50';
          context.lineWidth = 1;
          context.strokeRect(x, y, width, NOTE_HEIGHT);
        });
      } else {
        console.log("PianoRoll DEBUG - No notes found to draw in the current track");
      }
    };
    
    drawNoteGrid();
  }, [currentTrack, selectedNote, zoomLevel]);
  
  // Handle mouse down on the note grid
  const handleMouseDown = (e) => {
    const canvas = noteGridRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Check if clicking on an existing note
    const clickedNote = findNoteAtPosition(x, y);
    
    if (clickedNote) {
      setSelectedNote(clickedNote);
      
      // Check if clicking on the right edge (for resizing)
      const noteX = clickedNote.startTime * PIXELS_PER_BEAT * zoomLevel;
      const noteWidth = clickedNote.duration * PIXELS_PER_BEAT * zoomLevel;
      
      if (Math.abs(x - (noteX + noteWidth)) < 10) {
        setIsResizing(true);
      } else {
        setIsMoving(true);
      }
      
      setStartPoint({ x, y });
    } else {
      // Create a new note
      const beat = x / (PIXELS_PER_BEAT * zoomLevel);
      const pitch = 108 - Math.floor(y / NOTE_HEIGHT);
      
      // Quantize the start time and duration
      const quantizedBeat = Math.round(beat / parseFloat(quantizeValue)) * parseFloat(quantizeValue);
      
      const newNote = {
        id: `note-${Date.now()}`,
        pitch,
        startTime: quantizedBeat,
        duration: parseFloat(quantizeValue),
        velocity: 100
      };
      
      addNote(selectedTrackId, newNote);
      setSelectedNote(newNote);
    }
  };
  
  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!selectedNote || (!isMoving && !isResizing)) return;
    
    const canvas = noteGridRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    
    if (isResizing) {
      // Calculate new duration based on drag distance
      const noteX = selectedNote.startTime * PIXELS_PER_BEAT * zoomLevel;
      const rawDuration = (x - noteX) / (PIXELS_PER_BEAT * zoomLevel);
      
      // Quantize duration
      const quantizedDuration = Math.max(
        parseFloat(quantizeValue),
        Math.round(rawDuration / parseFloat(quantizeValue)) * parseFloat(quantizeValue)
      );
      
      updateNote(selectedTrackId, selectedNote.id, {
        ...selectedNote,
        duration: quantizedDuration
      });
    } else if (isMoving) {
      // Calculate position change
      const deltaX = x - startPoint.x;
      const deltaBeat = deltaX / (PIXELS_PER_BEAT * zoomLevel);
      
      // Quantize the new start time
      const newStartTime = Math.max(
        0,
        Math.round((selectedNote.startTime + deltaBeat) / parseFloat(quantizeValue)) * parseFloat(quantizeValue)
      );
      
      updateNote(selectedTrackId, selectedNote.id, {
        ...selectedNote,
        startTime: newStartTime
      });
      
      setStartPoint({ x, y: startPoint.y });
    }
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    setIsResizing(false);
    setIsMoving(false);
  };
  
  // Handle key press for deleting notes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedNote && (e.key === 'Delete' || e.key === 'Backspace')) {
        deleteNote(selectedTrackId, selectedNote.id);
        setSelectedNote(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNote, deleteNote, selectedTrackId]);
  
  // Helper function to find a note at a specific position
  const findNoteAtPosition = (x, y) => {
    if (!currentTrack || !currentTrack.notes) return null;
    
    return currentTrack.notes.find(note => {
      const noteX = note.startTime * PIXELS_PER_BEAT * zoomLevel;
      const noteWidth = note.duration * PIXELS_PER_BEAT * zoomLevel;
      const noteY = (108 - note.pitch) * NOTE_HEIGHT;
      
      return (
        x >= noteX && 
        x <= noteX + noteWidth && 
        y >= noteY && 
        y <= noteY + NOTE_HEIGHT
      );
    });
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };
  
  // Handle quantize value change
  const handleQuantizeChange = (e) => {
    setQuantizeValue(e.target.value);
  };
  
  // DEBUG: Force select track with notes
  const forceSelectTrackWithNotes = () => {
    if (!currentSession?.tracks) return;
    
    const trackWithNotes = currentSession.tracks.find(track => 
      track.notes && track.notes.length > 0
    );
    
    if (trackWithNotes) {
      console.log("PianoRoll DEBUG - Force selecting track with notes:", {
        id: trackWithNotes.id,
        name: trackWithNotes.name,
        noteCount: trackWithNotes.notes.length
      });
      setSelectedTrackId(trackWithNotes.id);
      
      // ENHANCED: Force a refresh after selecting track
      if (typeof forceRefresh === 'function') {
        console.log("PianoRoll DEBUG - Forcing refresh after track selection");
        forceRefresh();
      }
    } else {
      console.log("PianoRoll DEBUG - No tracks with notes found");
    }
  };
  
  return (
    <div className="piano-roll" data-testid="piano-roll-container">
      <div className="piano-roll-toolbar">
        <div className="track-selector">
          <label>
            Track:
            <select
              value={selectedTrackId || ''}
              onChange={(e) => setSelectedTrackId(parseInt(e.target.value))}
            >
              {/* ENHANCED: Add message if no tracks available */}
              {currentSession.tracks.length === 0 ? (
                <option value="">No tracks available</option>
              ) : (
                currentSession.tracks.map(track => (
                  <option key={track.id} value={track.id}>
                    {track.name} {track.notes?.length ? `(${track.notes.length} notes)` : ''}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        
        <div className="zoom-controls">
          <button aria-label="Zoom Out" onClick={handleZoomOut}>-</button>
          <span>Zoom</span>
          <button aria-label="Zoom In" onClick={handleZoomIn}>+</button>
        </div>
        
        <div className="quantize-control">
          <label>
            Quantize:
            <select
              aria-label="Quantize"
              value={quantizeValue}
              onChange={handleQuantizeChange}
            >
              <option value="0.25">1/16</option>
              <option value="0.5">1/8</option>
              <option value="1">1/4</option>
              <option value="2">1/2</option>
              <option value="4">1</option>
            </select>
          </label>
        </div>
        
        {/* DEBUG: Force select button */}
        <button 
          onClick={forceSelectTrackWithNotes}
          style={{background: 'orange', padding: '5px', margin: '5px'}}
        >
          Force Select Track With Notes
        </button>
        
        {/* ENHANCED: Add refresh button */}
        <button 
          onClick={() => {
            if (typeof forceRefresh === 'function') {
              console.log("PianoRoll DEBUG - Manual refresh triggered");
              forceRefresh();
            }
          }}
          style={{background: 'lightgreen', padding: '5px', margin: '5px'}}
        >
          Refresh Display
        </button>
      </div>
      
      <div className="piano-roll-content">
        <div className="piano-keys-container">
          <canvas
            ref={pianoKeysRef}
            data-testid="piano-keys"
            width={100}
            height={88 * NOTE_HEIGHT}
          />
        </div>
        
        <div className="note-grid-container">
          <canvas
            ref={noteGridRef}
            data-testid="note-grid"
            width={GRID_WIDTH}
            height={88 * NOTE_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
};

export default PianoRoll;