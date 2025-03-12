// jest.config.js
module.exports = {
  // Setup environment
  setupFilesAfterEnv: ['<rootDir>/setupTests.js', '<rootDir>/jest.setup.js'],
  
  // Test timeout
  testTimeout: 15000,
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/server/server.js'
  ],
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Mock file extensions - using only the root mocks directory
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^tone$': '<rootDir>/tests/__mocks__/tone.js',
    '^../../src/client/contexts/SessionContext$': '<rootDir>/tests/__mocks__/SessionContext.js',
    '^@/components/(.*)$': '<rootDir>/src/client/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/client/services/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/client/contexts/$1',
    '^@/utils/(.*)$': '<rootDir>/src/client/utils/$1'
  },
  
  // Set up paths to ignore for tests
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Set up paths to ignore for mocks to avoid duplicate mock warnings
  modulePathIgnorePatterns: [
    '<rootDir>/tests/__mocks__/fileMock.js',
    '<rootDir>/tests/__mocks__/styleMock.js'
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Reset mocks for each test
  resetMocks: false,
  
  // Reset modules for each test
  resetModules: false,
  
  // Restore mocks for each test
  restoreMocks: false,
  
  // Configure coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    }
  },
  
  // Configure Jest to suppress Mongoose warnings in test output
  globals: {
    SUPPRESS_JEST_WARNINGS: true
  }
};