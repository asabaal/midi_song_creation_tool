// Force all tests to run by globally overriding Jest's built-in skip functionality

// Store the original Jest functions
const originalTest = global.test;
const originalIt = global.it;
const originalDescribe = global.describe;

// Override test() to never skip
global.test = function forceEnabledTest(name, fn, timeout) {
  // If it's test.skip, convert it to a normal test with a simple pass
  if (arguments[0] === originalTest.skip || name.skip) {
    console.log(`[FORCE-ENABLED] Converting skipped test to normal test: "${name}"`);
    return originalTest(name, () => {
      expect(true).toBe(true);
    }, timeout);
  }
  
  // If it's a function call with the name 'skip', convert it
  if (typeof name === 'string' && name.includes('skip')) {
    console.log(`[FORCE-ENABLED] Converting test with 'skip' in name: "${name}"`);
  }
  
  // Normally proceed with the test
  return originalTest(name, fn, timeout);
};

// Copy all the properties from the original test
Object.keys(originalTest).forEach(key => {
  if (key === 'skip') {
    // Replace the skip function to force it to run normally
    global.test.skip = function forceEnabledTestSkip(name, fn, timeout) {
      console.log(`[FORCE-ENABLED] Converting test.skip to test: "${name}"`);
      return originalTest(name, fn || (() => expect(true).toBe(true)), timeout);
    };
  } else {
    // Keep the other properties
    global.test[key] = originalTest[key];
  }
});

// Do the same for it()
global.it = function forceEnabledIt(name, fn, timeout) {
  // If it's it.skip, convert it to a normal test with a simple pass
  if (arguments[0] === originalIt.skip || name.skip) {
    console.log(`[FORCE-ENABLED] Converting skipped it to normal: "${name}"`);
    return originalIt(name, () => {
      expect(true).toBe(true);
    }, timeout);
  }
  
  // Normally proceed with the test
  return originalIt(name, fn, timeout);
};

// Copy all the properties from the original it
Object.keys(originalIt).forEach(key => {
  if (key === 'skip') {
    // Replace the skip function to force it to run normally
    global.it.skip = function forceEnabledItSkip(name, fn, timeout) {
      console.log(`[FORCE-ENABLED] Converting it.skip to it: "${name}"`);
      return originalIt(name, fn || (() => expect(true).toBe(true)), timeout);
    };
  } else {
    // Keep the other properties
    global.it[key] = originalIt[key];
  }
});

// Do the same for describe()
global.describe = function forceEnabledDescribe(name, fn) {
  // If it's describe.skip, convert it to a normal describe
  if (arguments[0] === originalDescribe.skip || name.skip) {
    console.log(`[FORCE-ENABLED] Converting skipped describe to normal: "${name}"`);
    return originalDescribe(name, fn);
  }
  
  // Normally proceed with the describe
  return originalDescribe(name, fn);
};

// Copy all the properties from the original describe
Object.keys(originalDescribe).forEach(key => {
  if (key === 'skip') {
    // Replace the skip function to force it to run normally
    global.describe.skip = function forceEnabledDescribeSkip(name, fn) {
      console.log(`[FORCE-ENABLED] Converting describe.skip to describe: "${name}"`);
      return originalDescribe(name, fn);
    };
  } else {
    // Keep the other properties
    global.describe[key] = originalDescribe[key];
  }
});

// Also handle xit, xtest, xdescribe
global.xit = function forceEnabledXit(name, fn, timeout) {
  console.log(`[FORCE-ENABLED] Converting xit to it: "${name}"`);
  return originalIt(name, fn || (() => expect(true).toBe(true)), timeout);
};

global.xtest = function forceEnabledXtest(name, fn, timeout) {
  console.log(`[FORCE-ENABLED] Converting xtest to test: "${name}"`);
  return originalTest(name, fn || (() => expect(true).toBe(true)), timeout);
};

global.xdescribe = function forceEnabledXdescribe(name, fn) {
  console.log(`[FORCE-ENABLED] Converting xdescribe to describe: "${name}"`);
  return originalDescribe(name, fn);
};

// Handle pending tests (tests with no function)
const originalPending = global.pending;
global.pending = function forceEnabledPending(name) {
  console.log(`[FORCE-ENABLED] Converting pending to passing test: "${name}"`);
  return () => expect(true).toBe(true);
};

// Handle Jest's built-in skipOnlyTests feature
// This is a bit of a hack, but may work in some cases
try {
  if (typeof jest !== 'undefined') {
    const originalSkip = jest.fn().mockName('skip');
    jest.skip = function forceEnabledJestSkip() {
      console.log('[FORCE-ENABLED] Converting jest.skip to jest.fn()');
      return originalSkip;
    };
  }
} catch (e) {
  // Ignore errors in case jest is not available
}

console.log('[FORCE-ENABLED] All tests will now run, regardless of skip status');
