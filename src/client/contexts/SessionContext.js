// Context re-exports for both ES modules and CommonJS
const SessionContextModule = require('./SessionContext.jsx');

// Re-export everything
exports.default = SessionContextModule.default;
exports.useSessionContext = SessionContextModule.useSessionContext;
exports.SessionProvider = SessionContextModule.SessionProvider;

// Also add CommonJS module.exports for better compatibility
module.exports = {
  default: SessionContextModule.default,
  useSessionContext: SessionContextModule.useSessionContext,
  SessionProvider: SessionContextModule.SessionProvider
};
