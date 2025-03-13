// Simple jest mock setup that doesn't override read-only properties

// Mock PianoRoll component
jest.mock('../src/client/components/PianoRoll', () => {
  return require('./__mocks__/client/components/PianoRoll.jsx').default;
}, { virtual: true });

// Log when this mock is used
const originalJestMock = jest.mock;
jest.mock = function(path, factory, options) {
  if (path.includes('PianoRoll')) {
    console.log(`Mocking: ${path}`);
  }
  return originalJestMock.call(this, path, factory, options);
};

console.log('PianoRoll mocks have been set up');
