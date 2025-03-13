import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create context
const SessionContext = createContext();

/**
 * Session Provider component - provides session state to all children
 */
export const SessionProvider = ({ children, initialSession }) => {
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

  // Update specific transport settings
  const updateTransport = (transportSettings) => {
    setCurrentSession(prevSession => ({
      ...prevSession,
      ...transportSettings
    }));
  };

  // Create, update, or delete a track
  const updateTrack = (trackId, trackData) => {
    setCurrentSession(prevSession => {
      const tracks = [...prevSession.tracks];
      const trackIndex = tracks.findIndex(track => track.id === trackId);
      
      if (trackIndex >= 0) {
        // Update existing track
        tracks[trackIndex] = {
          ...tracks[trackIndex],
          ...trackData
        };
      } else {
        // Create new track
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
    setCurrentSession(prevSession => ({
      ...prevSession,
      tracks: prevSession.tracks.filter(track => track.id !== trackId)
    }));
  };

  // Save the current session
  const saveSession = async () => {
    // Mock implementation - would normally save to a backend
    console.log('Saving session:', currentSession);
    return {
      success: true,
      message: 'Session saved successfully'
    };
  };

  // Add note to a track
  const addNoteToTrack = (trackId, noteData) => {
    setCurrentSession(prevSession => {
      const tracks = [...prevSession.tracks];
      const trackIndex = tracks.findIndex(track => track.id === trackId);
      
      if (trackIndex >= 0) {
        // Add note to existing track
        const noteId = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newNote = { id: noteId, ...noteData };
        
        tracks[trackIndex] = {
          ...tracks[trackIndex],
          notes: [...(tracks[trackIndex].notes || []), newNote]
        };
      }
      
      return {
        ...prevSession,
        tracks
      };
    });
  };

  // Context value to be provided
  const contextValue = {
    currentSession,
    setCurrentSession,
    updateTransport,
    updateTrack,
    deleteTrack,
    saveSession,
    addNoteToTrack
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
