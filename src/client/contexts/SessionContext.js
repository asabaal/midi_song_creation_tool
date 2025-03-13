// This is a symlink file to ensure test mocks work correctly
// It proxies the actual context implementation

const context = require('../context/SessionContext');

module.exports = context;
