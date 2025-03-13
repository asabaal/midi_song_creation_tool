// Test diagnostics helper
// Add this to your Jest setup file to diagnose test issues

// Track component import attempts and failures
const originalJestMock = jest.mock;
jest.mock = function mockWithTracking(modulePath, factory, options) {
  console.log(`[DIAGNOSTIC] Mock requested for: ${modulePath}`);
  return originalJestMock.call(this, modulePath, factory, options);
};

// Track component imports
const originalRequire = module.require;
module.require = function requireWithTracking(path) {
  try {
    // Only log component-related imports
    if (path.includes('Piano') || path.includes('Component') || path.includes('piano')) {
      console.log(`[DIAGNOSTIC] Require called for: ${path}`);
    }
    return originalRequire.apply(this, arguments);
  } catch (error) {
    console.log(`[DIAGNOSTIC] Error requiring: ${path}`, error.message);
    throw error;
  }
};

// Track test definitions
if (typeof global.describe !== 'undefined') {
  const originalDescribe = global.describe;
  
  global.describe = function describeWithTracking(name, fn) {
    console.log(`[DIAGNOSTIC] Test suite defined: "${name}"`);
    
    // If it's the problematic test suite, log the call stack to find where it's defined
    if (name === 'PianoRoll Component State Management') {
      console.log('[DIAGNOSTIC] Found PianoRoll test definition at:');
      console.log(new Error().stack);
    }
    
    return originalDescribe.call(this, name, fn);
  };
  
  // Ensure describe methods still work
  global.describe.skip = originalDescribe.skip;
  global.describe.only = originalDescribe.only;
  global.describe.each = originalDescribe.each;
}

// Track React component rendering
const React = require('react');
const originalCreateElement = React.createElement;

React.createElement = function createElementWithTracking(type, props, ...children) {
  // Track PianoRoll rendering attempts
  if (type && (
    (typeof type === 'string' && type.includes('Piano')) || 
    (typeof type === 'function' && type.name && type.name.includes('Piano'))
  )) {
    console.log(`[DIAGNOSTIC] Rendering component: ${typeof type === 'string' ? type : type.name}`);
    console.log('[DIAGNOSTIC] Component value:', type);
    if (!type) {
      console.log('[DIAGNOSTIC] Component render stack:', new Error().stack);
    }
  }
  
  return originalCreateElement.apply(React, [type, props, ...children]);
};

// Add a special error handler for undefined components
const originalConsoleError = console.error;
console.error = function errorWithDiagnostics(...args) {
  // Check for the specific error we're looking for
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Element type is invalid')) {
    console.log('[DIAGNOSTIC] Component render error details:');
    console.log('Error occurred at:', new Error().stack);
    
    // Log current test context if available
    if (global.jasmine && global.jasmine.currentTest) {
      console.log('Current test:', global.jasmine.currentTest.fullName);
    }
  }
  
  return originalConsoleError.apply(this, args);
};

console.log('[DIAGNOSTIC] Test diagnostics loaded');
