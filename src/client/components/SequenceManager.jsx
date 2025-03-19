import React, { useState, useEffect } from 'react';
import { useSessionContext } from '../context/SessionContext';
import '../styles/SequenceManager.css';

/**
 * SequenceManager component - manages sequences within a session
 * Provides UI for creating, deleting, and switching between sequences
 */
const SequenceManager = () => {
  const { 
    currentSession, 
    setCurrentSession, 
    selectedTrackId, 
    setSelectedTrackId,
    forceRefresh
  } = useSessionContext();

  const [newSequenceName, setNewSequenceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // Log current state for debugging
  useEffect(() => {
    console.log('SequenceManager DEBUG - Current session:', {
      id: currentSession?.id,
      currentSequenceId: currentSession?.currentSequenceId,
      tracks: currentSession?.tracks?.length || 0
    });

    if (currentSession?.tracks) {
      console.log('SequenceManager DEBUG - Tracks:');
      currentSession.tracks.forEach(track => {
        console.log(`  - Track ${track.id} (${track.name}): ${track.notes?.length || 0} notes`);
      });
    }
  }, [currentSession]);

  // Handle selecting a different sequence
  const handleSequenceSelect = (trackId) => {
    console.log(`SequenceManager DEBUG - Selecting sequence: ${trackId}`);
    
    if (!trackId || !currentSession?.tracks) return;
    
    // Update selected track
    setSelectedTrackId(trackId);
    
    // Also update the current sequence ID in the session
    setCurrentSession(prevSession => ({
      ...prevSession,
      currentSequenceId: trackId
    }));
    
    if (typeof forceRefresh === 'function') {
      forceRefresh();
    }
  };

  // Handle creating a new sequence
  const handleCreateSequence = async () => {
    try {
      setError(null);
      setIsCreating(true);
      
      if (!newSequenceName.trim()) {
        setError('Sequence name cannot be empty');
        return;
      }
      
      // Generate a unique ID for the new sequence/track
      const newId = `seq_${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      
      // Create a new track (which serves as both track and sequence)
      const newTrack = {
        id: newId,
        name: newSequenceName.trim(),
        notes: [],
        instrument: 0
      };
      
      // Add the new track to the session
      setCurrentSession(prevSession => {
        // Create updated tracks array with the new track
        const updatedTracks = [...(prevSession.tracks || []), newTrack];
        
        return {
          ...prevSession,
          tracks: updatedTracks,
          currentSequenceId: newId  // Set the new sequence as current
        };
      });
      
      // Set the new track as selected
      setSelectedTrackId(newId);
      
      // Reset form
      setNewSequenceName('');
      
      // Force refresh to ensure UI updates
      if (typeof forceRefresh === 'function') {
        forceRefresh();
      }
      
      console.log(`SequenceManager DEBUG - Created new sequence: ${newId}`);
    } catch (err) {
      console.error('SequenceManager DEBUG - Error creating sequence:', err);
      setError(err.message || 'Failed to create sequence');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle deleting a sequence
  const handleDeleteSequence = (trackId) => {
    if (!trackId || !currentSession?.tracks) return;
    
    // Don't allow deleting the last sequence
    if (currentSession.tracks.length <= 1) {
      setError("Cannot delete the only sequence. Create a new one first.");
      return;
    }
    
    console.log(`SequenceManager DEBUG - Deleting sequence: ${trackId}`);
    
    // Remove the track from the session
    setCurrentSession(prevSession => {
      // Filter out the track to delete
      const updatedTracks = prevSession.tracks.filter(track => track.id !== trackId);
      
      // If we're deleting the current sequence, select another one
      let updatedCurrentSequenceId = prevSession.currentSequenceId;
      if (updatedCurrentSequenceId === trackId && updatedTracks.length > 0) {
        updatedCurrentSequenceId = updatedTracks[0].id;
      }
      
      return {
        ...prevSession,
        tracks: updatedTracks,
        currentSequenceId: updatedCurrentSequenceId
      };
    });
    
    // If we deleted the selected track, select another one
    if (selectedTrackId === trackId && currentSession.tracks.length > 1) {
      const otherTrack = currentSession.tracks.find(track => track.id !== trackId);
      if (otherTrack) {
        setSelectedTrackId(otherTrack.id);
      }
    }
    
    // Force refresh to ensure UI updates
    if (typeof forceRefresh === 'function') {
      forceRefresh();
    }
  };

  // Get class name for the sequence item based on selection and note status
  const getSequenceItemClass = (track) => {
    let className = 'sequence-item';
    
    // Add selected class if this sequence is selected
    if (track.id === selectedTrackId) {
      className += ' selected';
    }
    
    // Add current class if this is the current sequence
    if (track.id === currentSession?.currentSequenceId) {
      className += ' current';
    }
    
    // Add has-notes class if this sequence has notes
    if (track.notes && track.notes.length > 0) {
      className += ' has-notes';
    }
    
    return className;
  };

  return (
    <div className="sequence-manager">
      <h3>Sequences</h3>
      
      <div className="sequences-list">
        {currentSession?.tracks?.map(track => (
          <div key={track.id} className={getSequenceItemClass(track)}>
            <div 
              className="sequence-name" 
              onClick={() => handleSequenceSelect(track.id)}
              title={`${track.notes?.length || 0} notes`}
            >
              {track.name}
              {track.id === currentSession.currentSequenceId && 
                <span className="current-indicator" title="Current Sequence"> (current)</span>
              }
              <span className="note-count">
                {track.notes?.length || 0} notes
              </span>
            </div>
            <button 
              className="delete-btn"
              onClick={() => handleDeleteSequence(track.id)}
              title="Delete Sequence"
              disabled={currentSession.tracks.length <= 1}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      
      <div className="sequence-controls">
        <input
          type="text"
          placeholder="New Sequence Name"
          value={newSequenceName}
          onChange={(e) => setNewSequenceName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateSequence()}
        />
        <button 
          onClick={handleCreateSequence}
          disabled={isCreating || !newSequenceName.trim()}
        >
          Create Sequence
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="sequence-info">
        <p>
          <strong>Current Sequence:</strong> {
            currentSession?.tracks?.find(t => t.id === currentSession.currentSequenceId)?.name || 'None'
          }
        </p>
        <p>
          <strong>Selected Sequence:</strong> {
            currentSession?.tracks?.find(t => t.id === selectedTrackId)?.name || 'None'
          }
        </p>
      </div>
    </div>
  );
};

export default SequenceManager;