// setupTests.js
import 'jest-canvas-mock';

// Mock the window.fs API that might be used in tests
global.window = global.window || {};
global.window.fs = {
  readFile: jest.fn().mockResolvedValue(new Uint8Array()),
};

// Mock the Tone.js library
jest.mock('tone', () => {
  return {
    Transport: {
      start: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      position: '0:0:0',
      bpm: { value: 120 },
      timeSignature: 4,
      loop: false,
      setLoopPoints: jest.fn(),
      schedule: jest.fn(),
    },
    Part: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      add: jest.fn(),
    })),
    now: jest.fn().mockReturnValue(0),
    Time: jest.fn().mockImplementation((time) => time),
    Player: jest.fn().mockImplementation(() => ({
      toDestination: jest.fn().mockReturnThis(),
      sync: jest.fn().mockReturnThis(),
      start: jest.fn(),
    })),
  };
});

// Mock document.createRange for testing-library
if (typeof document !== 'undefined') {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    }),
  });
}
