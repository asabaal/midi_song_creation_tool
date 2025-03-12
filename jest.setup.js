// jest.setup.js

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