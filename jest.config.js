// jest.config.js
module.exports = {
  // Base test environment
  testEnvironment: 'node',
  
  // Different test environments for different test files
  projects: [
    {
      displayName: 'Server Tests',
      testMatch: ['<rootDir>/tests/unit/server/**/*.test.js', '<rootDir>/tests/integration/api/**/*.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'Client Tests',
      testMatch: ['<rootDir>/tests/unit/client/**/*.test.{js,jsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'Core Library Tests',
      testMatch: ['<rootDir>/tests/unit/core/**/*.test.js'],
      testEnvironment: 'node',
    },
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/*.config.js',
    '!**/coverage/**',
  ],
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Coverage reporters
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  
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
    './src/core/': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    './src/server/': {
      statements: 75,
      branches: 65,
      functions: 75,
      lines: 75,
    },
  },
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Ignore transformations
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|jest-runtime)).+\\.js$'
  ],
  
  // Custom reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results/jest',
      outputName: 'results.xml',
    }]
  ],
};
