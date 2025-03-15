// Global test overrides
if (typeof global.test !== 'undefined') {
  // Store original test function
  const originalTest = global.test;
  
  // FIXED: Removed test override that was skipping piano roll tests
  // Now all tests will run normally
  
  // Ensure test.skip and other methods still work
  global.test.skip = originalTest.skip;
  global.test.only = originalTest.only;
  global.test.each = originalTest.each;
}
