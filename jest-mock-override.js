// Mock overrides for Jest

// Mock PianoRoll component
jest.mock('../src/client/components/PianoRoll', () => {
  return {
    __esModule: true,
    default: require('./__mocks__/pianoroll/PianoRoll.jsx').default
  };
}, { virtual: true });

// Mock SessionContext
jest.mock('../src/client/contexts/SessionContext', () => {
  return require('./__mocks__/SessionContext.js');
}, { virtual: true });

jest.mock('../src/client/context/SessionContext', () => {
  return require('./__mocks__/SessionContext.js');
}, { virtual: true });
