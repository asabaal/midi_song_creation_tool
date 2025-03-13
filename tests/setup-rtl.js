// tests/setup-rtl.js - Setup file for React Testing Library
import '@testing-library/jest-dom';

// This file can contain custom matchers and utilities for React Testing Library
// that should be available for all tests.

// For example, extending jest-dom with custom matchers:
expect.extend({
  toHaveBackgroundSize(element, expected) {
    const computedStyle = window.getComputedStyle(element);
    const actualValue = computedStyle.backgroundSize;
    
    const pass = actualValue === expected;
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected element not to have background-size: ${expected}, but it did.`
          : `Expected element to have background-size: ${expected}, but it had ${actualValue}.`
    };
  },
});

// Extend RTL's screen object with custom queries if needed
