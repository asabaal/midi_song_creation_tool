// jest.setup.js - global setup for Jest tests

// Increase the timeout for all tests to handle async operations
jest.setTimeout(30000);

// Add global cleanup
afterAll(async () => {
  // Give time for any open handles to close
  await new Promise(resolve => setTimeout(resolve, 500));
});