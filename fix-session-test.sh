#!/bin/bash

# Fix the SessionContext path issue by creating a mock for tests

# Ensure directories exist
mkdir -p tests/__mocks__

# Create the SessionContext mock in the right location
cat > tests/__mocks__/SessionContext.jsx << 'EOL'
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
EOL

# Create the CommonJS bridge
cat > tests/__mocks__/SessionContext.js << 'EOL'
// tests/__mocks__/SessionContext.js - CommonJS bridge
const SessionContextModule = require('./SessionContext.jsx');

// Re-export everything for both ES and CommonJS
module.exports = {
  default: SessionContextModule.default,
  useSessionContext: SessionContextModule.useSessionContext,
  SessionProvider: SessionContextModule.SessionProvider,
  __esModule: true
};
EOL

echo "Session context mock has been set up in tests/__mocks__/"
