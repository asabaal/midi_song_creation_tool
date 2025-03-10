/**
 * Session Context
 * Provides session state and functions to the application
 */

import React, { createContext, useContext, useState } from 'react';

// Create the context
const SessionContext = createContext();

// Custom hook for using the session context
export const useSessionContext = () => useContext(SessionContext);

// SessionProvider component
export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState({
    id: 'default-session',
    name: 'Untitled Session',
    tracks: [],
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 }
  });

  // Context value
  const contextValue = {
    currentSession,
    setCurrentSession,
    // Add more session-related functions here
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
