#!/bin/bash

# Script to fix the path issues in client component tests

# Create a mapping for the SessionContext in the correct location
cat > tests/__mocks__/context/SessionContext.js << 'EOL'
// Mock SessionContext for tests
import React from 'react';

// Export the same interface as the real SessionContext
const mockUpdateTransport = jest.fn();
const mockAddNoteToTrack = jest.fn();

// Default mock session data
const mockSessionData = {
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
  updateTransport: mockUpdateTransport,
  addNoteToTrack: mockAddNoteToTrack
};

// Create the useSessionContext hook
export const useSessionContext = jest.fn().mockImplementation(() => mockSessionData);

// Create the Provider component
export const SessionProvider = ({ children }) => children;

// Create the default export
const SessionContext = React.createContext(mockSessionData);
export default SessionContext;
EOL

# Fix the directory structure
mkdir -p tests/__mocks__/context
mkdir -p tests/__mocks__/contexts

# Link them together for compatibility
cp tests/__mocks__/context/SessionContext.js tests/__mocks__/contexts/SessionContext.js

echo "Created compatible SessionContext mock files in both paths"
echo "This should fix the context path issues in tests"
