// setupTests.js
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Add any custom matchers or globals that should be available across all tests

// Mock ResizeObserver (needed for components that use it)
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.getContext for tests
HTMLCanvasElement.prototype.getContext = function() {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x, y, w, h) => ({
      data: new Array(w * h * 4)
    }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  };
};

// Mock CSS properties for elements with getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => {
      // Return custom values for specific properties
      if (prop === 'background-size') {
        return '20px 20px';
      }
      return '';
    },
    backgroundSize: '20px 20px',
  }),
});

// Mock transportService
global.transportService = {
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setBPM: jest.fn(),
  setTimeSignature: jest.fn(),
  setLoop: jest.fn(),
  isPlaying: jest.fn().mockReturnValue(false),
  getPosition: jest.fn().mockReturnValue('0:0:0'),
  getBPM: jest.fn().mockReturnValue(120),
  getTimeSignature: jest.fn().mockReturnValue('4/4'),
  isLooping: jest.fn().mockReturnValue(false),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
};

// Mock sessionService
global.sessionService = {
  getCurrentSession: jest.fn(),
  createSession: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  getSessions: jest.fn(),
};

// Mock updateTransportMock 
global.updateTransportMock = jest.fn();
