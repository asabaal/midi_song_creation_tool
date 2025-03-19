import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as apiService from '../services/apiService';

// Create context
const SessionContext = createContext();

/**
 * Session Provider component - provides session state to all children
 */
export const SessionProvider = ({ children, initialSession }) => {
  console.log(`DEBUG SessionProvider - Initializing with initialSession:`, initialSession);
  
  const [currentSession, setCurrentSession] = useState(initialSession || {
    id: 'new-session',
    name: 'New Session',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [],
    loop: {
      enabled: false,
      start: 0,
      end: 16
    }
  });
  
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log session changes for debugging
  useEffect(() => {
    console.log(`DEBUG SessionContext - Current session updated:`, {
      id: currentSession.id,
      name: currentSession.name,
      tracks: currentSession.tracks?.length || 0,
      selectedTrackId
    });
    
    // Log details about each track
    if (currentSession?.tracks) {
      currentSession.tracks.forEach(track => {
        console.log(`DEBUG SessionContext - Track ${track.id} (${track.name}) has ${track.notes?.length || 0} notes`);
      });
    }
    
    // If this is a new session and we have no real session yet, try to create one
    if (currentSession.id === 'new-session') {
      console.log(`DEBUG SessionContext - Detected "new-session" ID, should create a real session`);
      createNewSession();
    }
    
    // Set default selected track
    if (currentSession.tracks && currentSession.tracks.length > 0 && !selectedTrackId) {
      // If currentSequenceId is set, use that as the selected track
      if (currentSession.currentSequenceId) {
        console.log(`DEBUG SessionContext - Setting selected track to match currentSequenceId: ${currentSession.currentSequenceId}`);
        setSelectedTrackId(currentSession.currentSequenceId);
      } else {
        const firstTrackId = currentSession.tracks[0].id;
        console.log(`DEBUG SessionContext - Setting default selected track to first track: ${firstTrackId}`);
        setSelectedTrackId(firstTrackId);
      }
    }
  }, [currentSession, selectedTrackId]);

  // Create a new session on the server
  const createNewSession = async () => {
    try {
      console.log(`DEBUG SessionContext - Creating new session on server`);
      setIsLoading(true);
      setError(null);
      
      const result = await apiService.createSession({
        name: currentSession.name,
        bpm: currentSession.bpm,
        timeSignature: currentSession.timeSignature
      });
      
      console.log(`DEBUG SessionContext - Session created successfully:`, result);
      
      if (result && result.sessionId) {
        // Get full session details
        const sessionDetails = await apiService.getSession(result.sessionId);
        console.log(`DEBUG SessionContext - Retrieved session details:`, sessionDetails);
        
        // Update with real session from server
        setCurrentSession(prevSession => ({
          ...prevSession,
          ...sessionDetails,
          id: result.sessionId // Ensure ID is set
        }));
      }
    } catch (err) {
      console.error(`DEBUG SessionContext - Error creating session:`, err);
      setError(err.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  // Update specific transport settings
  const updateTransport = (transportSettings) => {
    console.log(`DEBUG SessionContext - Updating transport settings:`, transportSettings);
    setCurrentSession(prevSession => ({
      ...prevSession,
      ...transportSettings
    }));
  };

  // Add notes to a track
  const addNotesToTrack = async (trackId, notes) => {
    try {
      console.log(`DEBUG SessionContext - Adding ${notes.length} notes to track ${trackId}`);
      
      // Find the track
      const trackIndex = currentSession.tracks.findIndex(track => track.id === trackId);
      if (trackIndex === -1) {
        console.error(`DEBUG SessionContext - Track ${trackId} not found`);
        throw new Error(`Track ${trackId} not found`);
      }
      
      // Update the track's notes
      setCurrentSession(prevSession => {
        const updatedTracks = [...prevSession.tracks];
        
        // Make sure track has notes array
        if (!updatedTracks[trackIndex].notes) {
          updatedTracks[trackIndex].notes = [];
        }
        
        // Add the new notes
        updatedTracks[trackIndex].notes = [
          ...updatedTracks[trackIndex].notes,
          ...notes
        ];
        
        console.log(`DEBUG SessionContext - Track now has ${updatedTracks[trackIndex].notes.length} notes`);
        
        return {
          ...prevSession,
          tracks: updatedTracks
        };
      });
      
      return true;
    } catch (err) {
      console.error(`DEBUG SessionContext - Error adding notes to track:`, err);
      setError(err.message || 'Failed to add notes to track');
      return false;
    }
  };

  // Add a single note to a track
  const addNote = (trackId, note) => {
    console.log(`DEBUG SessionContext - Adding single note to track ${trackId}:`, note);
    return addNotesToTrack(trackId, [note]);
  };

  // Update a note in a track
  const updateNote = (trackId, noteId, noteUpdates) => {
    console.log(`DEBUG SessionContext - Updating note ${noteId} in track ${trackId}:`, noteUpdates);
    
    setCurrentSession(prevSession => {
      const updatedTracks = [...prevSession.tracks];
      const trackIndex = updatedTracks.findIndex(track => track.id === trackId);
      
      if (trackIndex === -1) {
        console.error(`DEBUG SessionContext - Track ${trackId} not found for note update`);
        return prevSession;
      }
      
      const track = updatedTracks[trackIndex];
      if (!track.notes) {
        console.error(`DEBUG SessionContext - Track ${trackId} has no notes array`);
        return prevSession;
      }
      
      const noteIndex = track.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) {
        console.error(`DEBUG SessionContext - Note ${noteId} not found in track ${trackId}`);
        return prevSession;
      }
      
      // Update the note
      track.notes[noteIndex] = { ...track.notes[noteIndex], ...noteUpdates };
      
      return {
        ...prevSession,
        tracks: updatedTracks
      };
    });
  };

  // Delete a note from a track
  const deleteNote = (trackId, noteId) => {
    console.log(`DEBUG SessionContext - Deleting note ${noteId} from track ${trackId}`);
    
    setCurrentSession(prevSession => {
      const updatedTracks = [...prevSession.tracks];
      const trackIndex = updatedTracks.findIndex(track => track.id === trackId);
      
      if (trackIndex === -1) {
        console.error(`DEBUG SessionContext - Track ${trackId} not found for note deletion`);
        return prevSession;
      }
      
      const track = updatedTracks[trackIndex];
      if (!track.notes) {
        console.error(`DEBUG SessionContext - Track ${trackId} has no notes array`);
        return prevSession;
      }
      
      // Filter out the note to delete
      track.notes = track.notes.filter(note => note.id !== noteId);
      
      return {
        ...prevSession,
        tracks: updatedTracks
      };
    });
  };

  // Create, update, or delete a track
  const updateTrack = (trackId, trackData) => {
    console.log(`DEBUG SessionContext - Updating track ${trackId} with data:`, trackData);
    
    setCurrentSession(prevSession => {
      const tracks = [...prevSession.tracks];
      const trackIndex = tracks.findIndex(track => track.id === trackId);
      
      if (trackIndex >= 0) {
        // Update existing track
        console.log(`DEBUG SessionContext - Updating existing track at index ${trackIndex}`);
        tracks[trackIndex] = {
          ...tracks[trackIndex],
          ...trackData
        };
      } else {
        // Create new track
        console.log(`DEBUG SessionContext - Creating new track`);
        tracks.push({
          id: trackId || `track-${Date.now()}`,
          ...trackData
        });
      }
      
      return {
        ...prevSession,
        tracks
      };
    });
  };

  // Delete a track
  const deleteTrack = (trackId) => {
    console.log(`DEBUG SessionContext - Deleting track ${trackId}`);
    
    setCurrentSession(prevSession => ({
      ...prevSession,
      tracks: prevSession.tracks.filter(track => track.id !== trackId)
    }));
    
    // If we deleted the selected track, select another one
    if (selectedTrackId === trackId) {
      const newSelectedTrack = currentSession.tracks.find(track => track.id !== trackId);
      if (newSelectedTrack) {
        console.log(`DEBUG SessionContext - Selecting new track ${newSelectedTrack.id} after deletion`);
        setSelectedTrackId(newSelectedTrack.id);
      } else {
        console.log(`DEBUG SessionContext - No tracks left to select after deletion`);
        setSelectedTrackId(null);
      }
    }
  };

  // Save the current session
  const saveSession = async () => {
    // Mock implementation - would normally save to a backend
    console.log('DEBUG SessionContext - Saving session:', currentSession);
    return {
      success: true,
      message: 'Session saved successfully'
    };
  };

  // Force a UI refresh by making a shallow copy of the current session
  const forceRefresh = () => {
    console.log('DEBUG SessionContext - Forcing refresh of session data');
    setCurrentSession({...currentSession});
  };

  // Context value to be provided
  const contextValue = {
    currentSession,
    setCurrentSession,
    selectedTrackId,
    setSelectedTrackId,
    isLoading,
    error,
    updateTransport,
    updateTrack,
    deleteTrack,
    saveSession,
    addNotesToTrack,
    addNote,
    updateNote,
    deleteNote,
    forceRefresh
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialSession: PropTypes.object
};

// Custom hook to use the session context
export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

export default SessionContext;