// jest.setup.js
import '@testing-library/jest-dom';

// Polyfill for setImmediate and clearImmediate
if (typeof global.setImmediate !== 'function') {
  global.setImmediate = (callback, ...args) => global.setTimeout(callback, 0, ...args);
}

if (typeof global.clearImmediate !== 'function') {
  global.clearImmediate = (id) => global.clearTimeout(id);
}

// Polyfill for TextEncoder and TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// This line helps with act() warnings in React tests
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock ResizeObserver which isn't available in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;

// Mock Audio Context
window.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 }
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 0 }
  }),
  destination: {}
}));
