// tests/__mocks__/SessionContext.js - CommonJS bridge
const SessionContextModule = require('./SessionContext.jsx');

// Re-export everything for both ES and CommonJS
module.exports = {
  default: SessionContextModule.default,
  useSessionContext: SessionContextModule.useSessionContext,
  SessionProvider: SessionContextModule.SessionProvider,
  __esModule: true
};