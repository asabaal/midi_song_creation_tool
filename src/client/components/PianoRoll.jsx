// PianoRoll component
import React, { useRef, useEffect, useState } from 'react';
import { useSessionContext } from '../contexts/SessionContext';

const PianoRoll = () => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [gridSnap, setGridSnap] = useState(0.25);
  
  const { currentSession, addNoteToTrack } = useSessionContext ? useSessionContext() : {
    currentSession: { tracks: [] },
    addNoteToTrack: () => {}
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw gridlines
    const gridSize = 20 * zoom;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Draw horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw notes if any exist
    if (currentSession.tracks && currentSession.tracks.length > 0) {
      const selectedTrack = currentSession.tracks.find(t => t.id === currentSession.selectedTrackId);
      if (selectedTrack && selectedTrack.notes) {
        ctx.fillStyle = '#4285f4';
        
        selectedTrack.notes.forEach(note => {
          const x = note.start * gridSize * 4;
          const y = canvas.height - (note.pitch - 48) * gridSize;
          const width = note.duration * gridSize * 4;
          const height = gridSize;
          
          ctx.fillRect(x, y, width, height);
        });
      }
    }
  }, [canvasRef, zoom, currentSession]);
  
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  };
  
  const handleGridSnapChange = (e) => {
    setGridSnap(parseFloat(e.target.value));
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const gridSize = 20 * zoom;
    
    // Convert click coordinates to note properties
    const time = Math.floor(x / (gridSize * 4)) * gridSnap;
    const pitch = Math.floor(108 - (y / gridSize));
    
    // Add note to track (basic implementation)
    if (currentSession.selectedTrackId) {
      addNoteToTrack(currentSession.selectedTrackId, {
        pitch,
        start: time,
        duration: gridSnap,
        velocity: 100
      });
    }
  };
  
  return (
    <div data-testid="piano-roll">
      <div className="piano-roll-controls">
        <button data-testid="zoom-in" onClick={handleZoomIn}>Zoom In</button>
        <button data-testid="zoom-out" onClick={handleZoomOut}>Zoom Out</button>
        <select 
          data-testid="grid-snap-select"
          value={gridSnap}
          onChange={handleGridSnapChange}
        >
          <option value="1">1 Beat</option>
          <option value="0.5">1/2 Beat</option>
          <option value="0.25">1/4 Beat</option>
        </select>
      </div>
      
      <div data-testid="piano-roll-grid" style={{ backgroundSize: `${20 * zoom}px ${20 * zoom}px` }}>
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleCanvasClick}
          style={{ border: '1px solid #ccc' }}
        />
      </div>
    </div>
  );
};

export default PianoRoll;
