// test-utils.js
import React from 'react';
import { render as rtlRender } from '@testing-library/react';

// Import the context provider
import { SessionProvider } from '../src/client/context/SessionContext';

// Create a mockSessionContext
const mockSessionContext = {
  currentSession: {
    id: 'test-session-id',
    name: 'Test Session',
    author: 'Test User',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [
      { id: 0, name: 'Piano', type: 'instrument' },
      { id: 1, name: 'Bass', type: 'instrument' },
      { id: 2, name: 'Drums', type: 'drums' }
    ],
    sequences: {},
    notes: []
  },
  selectedTrackId: 0,
  setSelectedTrackId: jest.fn(),
  addNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  addNotesToTrack: jest.fn(),
  clearNotes: jest.fn(),
  createNewSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  exportSession: jest.fn(),
  importSession: jest.fn()
};

// Create a custom render function
function render(ui, { sessionContext = mockSessionContext, ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <SessionProvider value={sessionContext}>
        {children}
      </SessionProvider>
    );
  }
  
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { render };
