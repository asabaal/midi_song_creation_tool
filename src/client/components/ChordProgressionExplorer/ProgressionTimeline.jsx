import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as chordProgressionService from '../../services/chordProgressionService';

/**
 * Sortable Chord Item Component
 */
const SortableChordItem = ({ chord, index, onEdit, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chord.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`chord-block ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
      title={`${chord.name} - ${chord.duration}`}
    >
      <div className="chord-content">
        <div className="chord-name">{chord.name}</div>
        {chord.function && (
          <div className="chord-function">{chord.function}</div>
        )}
        <div className="chord-duration">
          {chord.duration}
        </div>
        {chord.isCustom && (
          <div className="chord-indicator custom">Custom</div>
        )}
      </div>
      
      <div className="chord-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(chord, index);
          }}
          className="action-btn edit"
          title="Edit chord"
          aria-label={`Edit ${chord.name}`}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(chord, index);
          }}
          className="action-btn remove"
          title="Remove chord"
          aria-label={`Remove ${chord.name}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

/**
 * Progression Timeline Component
 * 
 * Visual timeline showing chord progression with drag-and-drop editing,
 * playback position, and chord management.
 */
const ProgressionTimeline = ({ 
  progression, 
  tempo, 
  onEditChord, 
  onRemoveChord, 
  onReorderChords 
}) => {
  const [activeId, setActiveId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef(null);
  const animationRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id && over) {
      const oldIndex = typeof active.id === 'number' ? active.id : progression.findIndex(chord => chord.id === active.id);
      const newIndex = typeof over.id === 'number' ? over.id : progression.findIndex(chord => chord.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newProgression = arrayMove(progression, oldIndex, newIndex);
        onReorderChords(newProgression);
      }
    }
    
    setActiveId(null);
  };

  // Calculate timeline dimensions
  const calculateTimelineWidth = () => {
    if (progression.length === 0) return 100;
    
    const totalBeats = chordProgressionService.calculateProgressionDuration(progression, tempo).totalBeats;
    const pixelsPerBeat = 60;
    return Math.max(100, totalBeats * pixelsPerBeat);
  };

  // Calculate chord position and width
  const calculateChordStyle = (chord, index) => {
    const pixelsPerBeat = 60; // 60 pixels per beat for good visibility
    const left = (chord.startTime || 0) * pixelsPerBeat;
    const width = (chord.durationInBeats || 1) * pixelsPerBeat;
    
    return {
      left: `${left}px`,
      width: `${width}px`,
      minWidth: '80px' // Minimum width for readability
    };
  };



  // Handle chord edit
  const handleEditChord = (chord) => {
    onEditChord(chord);
  };

  // Handle chord remove
  const handleRemoveChord = (chord) => {
    if (confirm(`Remove "${chord.name}" from progression?`)) {
      onRemoveChord(chord.id);
    }
  };

  // Format time display
  const formatTime = (beats) => {
    const seconds = (beats / tempo) * 60;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };



  // Render time markers
  const renderTimeMarkers = () => {
    const totalBeats = chordProgressionService.calculateProgressionDuration(progression, tempo).totalBeats;
    const markers = [];
    
    // Add marker every 4 beats (or every beat if shorter progression)
    const interval = totalBeats <= 8 ? 1 : 4;
    
    for (let beat = 0; beat <= totalBeats; beat += interval) {
      const pixelsPerBeat = 60;
      const position = beat * pixelsPerBeat;
      markers.push(
        <div
          key={beat}
          className="time-marker"
          style={{ left: `${position}px` }}
        >
          <div className="marker-line"></div>
          <div className="marker-label">{formatTime(beat)}</div>
        </div>
      );
    }
    
    return markers;
  };

  const timelineWidth = calculateTimelineWidth();

  return (
    <div className="progression-timeline">
      <div className="timeline-header">
        <h4>Progression Timeline</h4>
        <div className="timeline-info">
          <span>Duration: {chordProgressionService.calculateProgressionDuration(progression, tempo).formattedTime}</span>
          <span>•</span>
          <span>{progression.length} chord{progression.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {progression.length === 0 ? (
        <div className="empty-timeline">
          <div className="empty-message">
            <p>No chords in progression yet</p>
            <p>Add chords using the controls above to see them here</p>
          </div>
        </div>
      ) : (
        <div className="timeline-container" ref={timelineRef}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="timeline-track"
              style={{ width: `${timelineWidth}px` }}
            >
              {/* Time markers */}
              <div className="time-markers">
                {renderTimeMarkers()}
              </div>

              {/* Chord blocks */}
              <SortableContext
                items={progression.map((chord, index) => chord.id || index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="chord-blocks">
                  {progression.map((chord, index) => (
                    <SortableChordItem
                      key={chord.id || index}
                      chord={chord}
                      index={index}
                      onEdit={handleEditChord}
                      onRemove={handleRemoveChord}
                    />
                  ))}
                </div>
              </SortableContext>

              {/* Playback position indicator */}
              {isPlaying && (
                <div 
                  className="playhead"
                  style={{ 
                    left: `${currentTime * 60}px`,
                    height: '100%'
                  }}
                >
                  <div className="playhead-line"></div>
                </div>
              )}
            </div>
            
            <DragOverlay>
              {activeId ? (
                <div className="chord-block dragging">
                  <div className="chord-content">
                    <div className="chord-name">
                      {progression.find(chord => chord.id === activeId || progression.indexOf(chord) === activeId)?.name}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Timeline controls */}
      {progression.length > 0 && (
        <div className="timeline-controls">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn ${isPlaying ? 'btn-danger' : 'btn-success'}`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            onClick={() => setCurrentTime(0)}
            className="btn btn-secondary"
          >
            ⏮️ Reset
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="timeline-instructions">
        <details>
          <summary className="instructions-toggle">Timeline Instructions</summary>
          <div className="instructions-content">
            <ul>
              <li><strong>Drag and drop:</strong> Reorder chords by dragging them to new positions</li>
              <li><strong>Edit chord:</strong> Click the pencil icon to modify a chord</li>
              <li><strong>Remove chord:</strong> Click the trash icon to delete a chord</li>
              <li><strong>Timeline view:</strong> Shows chord positions relative to time</li>
              <li><strong>Time markers:</strong> Display timing in minutes:seconds</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

ProgressionTimeline.propTypes = {
  progression: PropTypes.array.isRequired,
  tempo: PropTypes.number.isRequired,
  onEditChord: PropTypes.func.isRequired,
  onRemoveChord: PropTypes.func.isRequired,
  onReorderChords: PropTypes.func.isRequired
};

export default ProgressionTimeline;