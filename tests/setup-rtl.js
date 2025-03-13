// tests/setup-rtl.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  // Configures the timeout time in milliseconds for async utilities
  asyncUtilTimeout: 5000,
  
  // By default, React Testing Library will only log the DOM when a
  // test fails. Set this to true to always log to console.
  testIdAttribute: 'data-testid',
  
  // The retry function will try to find the element again if it's not found
  // on the first try
  retry: {
    // How many times to retry
    count: 3,
    // How long to wait between retries
    delay: 100,
  },
});
