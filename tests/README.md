# MIDI Song Creation Tool - Testing Suite

This directory contains the comprehensive test suite for the MIDI Song Creation Tool. The test organization follows industry best practices with a clear separation of unit, integration, and end-to-end tests.

## Test Structure

```
tests/
├── unit/                  # Unit tests for isolated components
│   ├── core/              # Tests for core MIDI processing functionality
│   ├── client/            # Tests for React components
│   │   └── components/    # Tests for individual UI components
│   └── server/            # Tests for server-side code
├── integration/           # Integration tests between components
│   └── api/               # Tests for API endpoints
├── e2e/                   # End-to-end tests with Cypress
│   └── cypress/
│       ├── fixtures/      # Test data for E2E tests
│       ├── plugins/       # Cypress plugins
│       ├── support/       # Support files and commands
│       └── specs/         # E2E test specifications
├── mocks/                 # Mock objects and functions
├── fixtures/              # Test fixtures (sample MIDI files, etc.)
└── README.md              # This file
```

## Running Tests

The project includes several npm scripts to run different types of tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (automatically re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run end-to-end tests with Cypress
npm run test:e2e

# Open Cypress test runner in interactive mode
npm run test:e2e:open

# Run tests in CI environment with coverage
npm run test:ci

# View coverage report in browser
npm run test:coverage:view
```

## Testing Tools

- **Jest**: Primary testing framework for unit and integration tests
- **React Testing Library**: Testing React components
- **Cypress**: End-to-end testing
- **Supertest**: API testing

## Best Practices

1. **Unit Tests**
   - Focus on testing individual functions, methods, or components in isolation
   - Mock dependencies
   - Keep assertions focused on behavior, not implementation details
   - Aim for high coverage of core business logic

2. **Integration Tests**
   - Test interactions between modules
   - Focus on API endpoints and data flow
   - Verify correct error handling

3. **End-to-End Tests**
   - Test full user workflows from UI to backend
   - Focus on critical paths that users will take
   - Use data attributes like `data-cy` as selectors

## Writing New Tests

When adding new functionality, follow this process:

1. Add unit tests for the core logic
2. Add integration tests if the functionality spans multiple modules
3. Add E2E tests for critical user flows

All tests should be clear, focused, and maintainable. Use descriptive test names that explain the expected behavior.

## Mocking

The `mocks/` directory contains shared mock implementations. Use these to ensure consistent mocking across tests.

When creating new mocks:
- Keep them focused on what you need to test
- Document any assumptions made
- Make them reusable when appropriate

## Coverage Requirements

The project aims for the following coverage targets:
- Core functionality: 90%+ line coverage
- Server API endpoints: 80%+ line coverage
- UI components: 70%+ line coverage

## Test Fixtures

Test fixtures are stored in the `fixtures/` directory. These include:
- Sample MIDI files
- Test data for API responses
- Other static assets needed for testing

## Migration Guide

When moving from the `develop` branch structure to the new structure in the `feature/project-structure` branch, refer to the [TEST_MIGRATION.md](../TEST_MIGRATION.md) file for guidance on how to adapt tests.
