// jest.setup.js - Global setup for all Jest tests

// Suppress specific console errors and warnings in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Filter out React useLayoutEffect warnings in test environment
  if (args[0].includes('useLayoutEffect does nothing on the server')) {
    return;
  }
  // Don't show act() warnings - common in async tests
  if (args[0].includes('Warning: An update to') && args[0].includes('inside a test was not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Filter out specific deprecation warnings that are not relevant to the tests
  if (args[0].includes('deprecated') && args[0].includes('react-test-renderer')) {
    return;
  }
  originalConsoleWarn(...args);
};

// Mock ResizeObserver for tests
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = MockResizeObserver;

// Set up any globals needed across tests
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Set global fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  })
);

// Add any additional global mocks needed
jest.mock('tone', () => ({
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    setLoopPoints: jest.fn(),
    bpm: {
      value: 120,
      set: jest.fn()
    },
    loop: false,
    timeSignature: 4,
    position: '0:0:0',
    state: 'stopped',
    on: jest.fn(),
    off: jest.fn(),
    cancel: jest.fn(),
    schedule: jest.fn(),
  },
  context: {
    currentTime: 0,
    resume: jest.fn().mockResolvedValue(undefined),
    state: 'running',
  },
  Synth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    dispose: jest.fn(),
  })),
  PolySynth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    dispose: jest.fn(),
  })),
  Channel: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    volume: { value: 0 },
    receive: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    dispose: jest.fn(),
  })),
  Destination: {
    volume: { value: 0 },
    mute: false,
  },
  start: jest.fn().mockResolvedValue(undefined),
  now: jest.fn().mockReturnValue(0),
}), { virtual: true });
