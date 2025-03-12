// tests/__mocks__/SessionContext.js
import React from 'react';

// Mock data
const defaultSession = {
  id: 'test-session-id',
  name: 'Test Session',
  tracks: [
    {
      id: 'track1',
      name: 'Test Track',
      instrument: 'piano',
      notes: [
        { id: 'note1', pitch: 60, start: 0, duration: 1, velocity: 100 }
      ]
    }
  ],
  tempo: 120,
  timeSignature: '4/4'
};

// Mock context functions
const mockFunctions = {
  setSelectedTrackId: jest.fn(),
  addNoteToTrack: jest.fn(),
  removeNoteFromTrack: jest.fn(),
  updateNoteInTrack: jest.fn(),
  addNotesToTrack: jest.fn(),
  createTrack: jest.fn(),
  deleteTrack: jest.fn(),
  updateTrackSettings: jest.fn(),
  setTempo: jest.fn(),
  setTimeSignature: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  exportSession: jest.fn(),
  importSession: jest.fn(),
  clearSession: jest.fn()
};

// Create context with default values
export const SessionContext = React.createContext({
  currentSession: defaultSession,
  selectedTrackId: 'track1',
  ...mockFunctions
});

// Custom hook to use the session context
export const useSessionContext = jest.fn().mockReturnValue({
  currentSession: defaultSession,
  selectedTrackId: 'track1',
  ...mockFunctions
});

// Provider component
export const SessionProvider = ({ children }) => {
  return (
    <SessionContext.Provider value={{
      currentSession: defaultSession,
      selectedTrackId: 'track1',
      ...mockFunctions
    }}>
      {children}
    </SessionContext.Provider>
  );
};