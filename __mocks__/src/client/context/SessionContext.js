// Mock for the SessionContext module
const mockContext = {
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

// Export mock hooks and providers
const useSessionContext = jest.fn(() => mockContext);
const SessionProvider = ({ children }) => children;

module.exports = {
  useSessionContext,
  SessionProvider
};
