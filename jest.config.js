// jest.config.js
module.exports = {
  // Base test environment
  testEnvironment: 'node',
  
  // Different test environments for different test files
  projects: [
    {
      displayName: 'server',
      testMatch: ['<rootDir>/tests/unit/server/**/*.test.js', '<rootDir>/tests/integration/api/**/*.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'client',
      testMatch: ['<rootDir>/tests/unit/client/**/*.test.js'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'core',
      testMatch: ['<rootDir>/tests/unit/core/**/*.test.js', '<rootDir>/tests/integration/modules/**/*.test.js'],
      testEnvironment: 'node',
    },
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  
  // Module path mapping (adjust based on your project structure)
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@server/(.*)$': '<rootDir>/src/server/$1',
    '^@client/(.*)$': '<rootDir>/src/client/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  
  // Threshold for code coverage
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};