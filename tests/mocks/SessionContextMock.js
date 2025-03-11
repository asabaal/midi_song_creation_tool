// tests/mocks/SessionContextMock.js
export const useSessionContext = jest.fn().mockReturnValue({
  currentSession: {
    id: 'test-session',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [
      {
        id: 0,
        name: 'Piano',
        instrument: 0,
        notes: [
          { id: 'note1', pitch: 60, startTime: 0, duration: 1, velocity: 100 },
          { id: 'note2', pitch: 64, startTime: 1, duration: 1, velocity: 100 },
          { id: 'note3', pitch: 67, startTime: 2, duration: 1, velocity: 100 },
        ]
      }
    ],
    loop: {
      enabled: false,
      start: 0,
      end: 16
    }
  },
  // Individual note operations
  addNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  
  // Track operations
  selectedTrackId: 0,
  setSelectedTrackId: jest.fn(),
  updateTransport: jest.fn(),
  
  // Batch operations
  addNotesToTrack: jest.fn(),
  clearTrack: jest.fn(),
  
  // Session operations
  createSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  
  // Export/Import operations
  exportMidi: jest.fn(),
  exportJson: jest.fn(),
  importJson: jest.fn()
});
