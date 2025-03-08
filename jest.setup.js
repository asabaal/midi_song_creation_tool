// jest.setup.js
// Setup for Jest DOM environment (for React component testing)

// Import testing libraries
require('@testing-library/jest-dom');

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Web Audio API
class AudioContextMock {
  createOscillator() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 0 },
    };
  }
  createGain() {
    return {
      connect: jest.fn(),
      gain: { value: 0 },
    };
  }
  createAnalyser() {
    return {
      connect: jest.fn(),
      fftSize: 0,
      getByteTimeDomainData: jest.fn(),
    };
  }
  destination = {};
}

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// Mock WebMIDI API
global.navigator.requestMIDIAccess = jest.fn().mockResolvedValue({
  inputs: {
    values: jest.fn().mockReturnValue([]),
  },
  outputs: {
    values: jest.fn().mockReturnValue([]),
  },
});
