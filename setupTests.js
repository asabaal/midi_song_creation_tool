// Import jest-dom's custom assertions
import '@testing-library/jest-dom';

// Mock the HTML5 canvas element which is not available in jsdom
HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Array(4).fill(0),
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({
      width: 0,
    })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  };
};

// Mock the SessionContext for components that use it
jest.mock('../src/client/context/SessionContext', () => {
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

  return {
    useSessionContext: jest.fn(() => mockContext),
    SessionProvider: ({ children }) => children
  };
});

// Mock any browser APIs not available in the test environment
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
