// tests/setup-dom.js - Setup file for DOM testing environment

// Mock the window object and related browser APIs

// Match media mock
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Animation frame mock
window.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
  return 0;
};

window.cancelAnimationFrame = function() {};

// Mock window.location
const locationMock = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  toString: jest.fn(),
  href: 'http://localhost/',
  pathname: '/',
  search: '',
  hash: '',
  protocol: 'http:',
  host: 'localhost',
  origin: 'http://localhost',
};

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// Mock for IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock for audio context
const AudioContextMock = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
  })),
  createGain: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    gain: { value: 0 },
  })),
  currentTime: 0,
  destination: {},
}));

window.AudioContext = AudioContextMock;
window.webkitAudioContext = AudioContextMock;

// Add a dummy canvas to the document body for tests that need it
if (typeof document !== 'undefined') {
  const canvas = document.createElement('canvas');
  canvas.id = 'global-test-canvas';
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);
}
