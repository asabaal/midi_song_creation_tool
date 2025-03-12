# Testing Framework Documentation

This document describes the testing setup for the MIDI Song Creation Tool.

## Test Structure

The tests are organized into three main categories:

1. **Unit Tests**: For testing individual functions, classes, and components in isolation.
2. **Integration Tests**: For testing API endpoints and how components work together.
3. **End-to-End Tests**: For testing the whole application flow with Cypress.

## Setup

### Jest Setup

- `setupTests.js` - Configures Jest and provides global test utilities like mock components and `@testing-library/jest-dom` assertions.
- `jest.config.js` - Main Jest configuration file that specifies test environment, module mappings, and other settings.

### Test Utils

- `tests/test-utils.js` - Custom render functions for React Testing Library that provide context providers and other test utilities.
- `__mocks__/fileMock.js` - Mock for file imports.

### Database Testing

- `tests/integration/testSetup.js` - Sets up an in-memory MongoDB database for integration tests using `mongodb-memory-server`.

## Running Tests

To run tests, use the following npm scripts:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```

## Best Practices

1. **Unit Tests**:
   - Keep tests focused on a single unit of functionality
   - Use mocks for external dependencies
   - For React components, use the custom render functions from `test-utils.js`

2. **Integration Tests**:
   - Tests that depend on the database should use the in-memory database setup
   - Create test data in `beforeEach` blocks and clean up in `afterEach`
   - Import the app after the database is connected for proper initialization

3. **General Tips**:
   - Write descriptive test names that explain what is being tested
   - Use appropriate assertions from Jest and Testing Library
   - Keep tests independent from each other

## Troubleshooting

If you encounter failing tests:

1. Check that component tests are using the custom render function from `test-utils.js`
2. Verify that API tests are properly setting up the in-memory database
3. For React component tests, ensure that required contexts are provided
4. Check for timing issues in asynchronous tests
