// jest.config.js
module.exports = {
  // Setup environment
  setupFilesAfterEnv: ['<rootDir>/setupTests.js', '<rootDir>/jest.setup.js', '<rootDir>/tests/setup-dom.js', '<rootDir>/tests/setup-rtl.js'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Test environment configuration
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    // Configure testEnvironment options
    url: 'http://localhost/'
  },
  
  // Project configuration
  projects: [
    // Node environment for API tests
    {
      displayName: 'API Tests',
      testMatch: ['<rootDir>/tests/integration/api/**/*.test.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
      },
      globals: {
        SUPPRESS_JEST_WARNINGS: true
      }
    },
    // jsdom for client components
    {
      displayName: 'Client Tests',
      testMatch: ['<rootDir>/tests/unit/client/**/*.test.{js,jsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/setupTests.js', '<rootDir>/tests/setup-dom.js', '<rootDir>/tests/setup-rtl.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
        '^tone$': '<rootDir>/tests/__mocks__/tone.js',
        '^../../src/client/contexts/SessionContext$': '<rootDir>/tests/__mocks__/SessionContext.js',
        '^@/components/(.*)$': '<rootDir>/src/client/components/$1',
        '^@/services/(.*)$': '<rootDir>/src/client/services/$1',
        '^@/contexts/(.*)$': '<rootDir>/src/client/contexts/$1',
        '^@/utils/(.*)$': '<rootDir>/src/client/utils/$1'
      }
    },
    // Node for server and core functions
    {
      displayName: 'Server/Core Tests',
      testMatch: [
        '<rootDir>/tests/unit/server/**/*.test.js',
        '<rootDir>/tests/unit/core/**/*.test.js',
        '<rootDir>/tests/integration/placeholder.test.js'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
      }
    }
  ],
  
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
  
  // Paths to ignore for tests
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Add module path ignore patterns to avoid duplicate mocks
  modulePathIgnorePatterns: ['<rootDir>/tests/__mocks__/'],
  
  // Only use one set of mocks to avoid duplicate warnings
  moduleDirectories: ['node_modules', 'src', '__mocks__'],
  
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
  
  // Configure Jest to suppress Mongoose warnings
  globals: {
    SUPPRESS_JEST_WARNINGS: true
  }
};