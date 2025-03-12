module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // Setup files that will be run before each test
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],

  // A map from regular expressions to module names or to arrays of module names
  moduleNameMapper: {
    // Handle CSS/SCSS files
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Path aliases (if applicable)
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // An array of regexp pattern strings that are matched against all file paths
  transformIgnorePatterns: ['/node_modules/(?!tone)/'],

  // Watchman plugins for filtering tests
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Avoid test runs that fail due to memory issues in large projects
  workerIdleMemoryLimit: '512MB'
};
