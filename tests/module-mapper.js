// Jest module mapper helper
// Add this to your Jest setup files

// Force import of PianoRoll component
jest.mock('../../../../src/client/components/PianoRoll', () => {
  return require('../__mocks__/client/components/PianoRoll.jsx').default;
}, { virtual: true });
