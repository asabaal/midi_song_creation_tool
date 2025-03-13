// SessionContext mock for tests
import React from 'react';

// Mock session state
const defaultSessionState = {
  currentSession: {
    id: 'test-session-id',
    name: 'Test Session',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [
      { id: 'track1', name: 'Piano', instrument: 'piano', notes: [] }
    ],
    loop: { enabled: false }
  }
};

// Mock context functions
const mockFunctions = {
  // Session operations
  updateTransport: jest.fn(),
  updateTrack: jest.fn(),
  deleteTrack: jest.fn(),
  saveSession: jest.fn(),
  
  // Note operations
  addNoteToTrack: jest.fn()
};

// Create a mock context object
const SessionContext = React.createContext({
  ...defaultSessionState,
  ...mockFunctions
});

// Create a custom provider for tests
export const SessionProvider = ({ children, customState = {} }) => {
  // Merge default state with any custom state passed in
  const contextValue = {
    ...defaultSessionState,
    ...mockFunctions,
    ...customState
  };
  
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Export custom hook
export const useSessionContext = jest.fn().mockImplementation(() => {
  return {
    ...defaultSessionState,
    ...mockFunctions
  };
});

export default SessionContext;