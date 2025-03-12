// test-utils.js
import React from 'react';
import { render as rtlRender } from '@testing-library/react';

// We'll now import from the mocked SessionContext
import { SessionProvider, useSessionContext } from '../src/client/context/SessionContext';

// Create a custom render function
function render(ui, { sessionContext, ...options } = {}) {
  // If a custom context is provided, override the mock temporarily
  if (sessionContext) {
    useSessionContext.mockReturnValue(sessionContext);
  }
  
  function Wrapper({ children }) {
    return (
      <SessionProvider>
        {children}
      </SessionProvider>
    );
  }
  
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { render };
