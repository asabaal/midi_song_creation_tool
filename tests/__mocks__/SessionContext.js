// tests/__mocks__/SessionContext.js
import React from 'react';

// Mock session state
const defaultSessionState = {
  id: 'test-session-id',
  name: 'Test Session',
  tempo: 120,
  timeSignature: '4/4',
  tracks: [
    { id: 'track1', name: 'Piano', instrument: 'piano', notes: [] }
  ],
  transport: {
    isPlaying: false,
    isRecording: false,
    currentPosition: '1.1.1',
    loopStart: 0,
    loopEnd: 16,
    isLooping: false
  }
};

// Mock context functions
const mockFunctions = {
  // Transport controls
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setTempo: jest.fn(),
  setTimeSignature: jest.fn(),
  toggleRecording: jest.fn(),
  toggleLoop: jest.fn(),
  setLoopPoints: jest.fn(),
  
  // Note operations
  addNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  clearNotes: jest.fn(),
  
  // Track operations
  addTrack: jest.fn(),
  updateTrack: jest.fn(),
  deleteTrack: jest.fn(),
  
  // Session operations
  createSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  updateSessionName: jest.fn(),
  
  // Pattern generation
  generatePattern: jest.fn(),
  
  // Import/Export
  exportMIDI: jest.fn(),
  importMIDI: jest.fn()
};

// Create a mock context object
const SessionContext = React.createContext({
  ...defaultSessionState,
  ...mockFunctions
});

// Create a custom provider for tests
export const SessionProvider = ({ children, customState = {} }) => {
  // Merge default state with any custom state passed in
  const sessionState = {
    ...defaultSessionState,
    ...customState
  };
  
  // Combined context value
  const contextValue = {
    ...sessionState,
    ...mockFunctions
  };
  
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Export custom hook
export const useSessionContext = () => {
  return React.useContext(SessionContext);
};

export default SessionContext;