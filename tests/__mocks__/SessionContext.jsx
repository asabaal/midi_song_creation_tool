import React from 'react';

// Create session context with mock data
const SessionContext = React.createContext({
  currentSession: {
    id: 'test-session-id',
    name: 'Test Session',
    bpm: 120,
    timeSignature: [4, 4],
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
    selectedTrackId: 'track1',
    loop: { enabled: false }
  },
  updateTransport: jest.fn(),
  addNoteToTrack: jest.fn()
});

// Provider component for tests
export const SessionProvider = ({ children, initialSession }) => {
  return (
    <SessionContext.Provider 
      value={{
        currentSession: initialSession || SessionContext._currentValue.currentSession,
        updateTransport: jest.fn(),
        addNoteToTrack: jest.fn()
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// Mock the hook
export const useSessionContext = jest.fn(() => SessionContext._currentValue);

export default SessionContext;
