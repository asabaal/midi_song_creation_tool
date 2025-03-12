// jest.setup.js

// Polyfill for setImmediate in the test environment
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback) => setTimeout(callback, 0);
}

// Mock global browser APIs that might be used in tests
if (typeof window === 'undefined') {
  global.window = {};
}

if (typeof document === 'undefined') {
  global.document = {
    createElement: jest.fn(),
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
  };
}

// Add any additional test environment setup here

// Setup testing framework extensions if needed
