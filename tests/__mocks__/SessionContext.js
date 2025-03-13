const SessionContextModule = require('./SessionContext.jsx');

// Export for both CommonJS and ES modules
module.exports = {
  ...SessionContextModule,
  default: SessionContextModule.default,
  useSessionContext: SessionContextModule.useSessionContext,
  SessionProvider: SessionContextModule.SessionProvider,
  __esModule: true
};
