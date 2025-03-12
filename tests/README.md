# MIDI Song Creation Tool Testing Suite

This directory contains the comprehensive testing suite for the MIDI Song Creation Tool. The tests are organized in a hierarchical structure to test various aspects of the application.

## Test Structure

```
tests/
├── unit/                  # Unit tests for individual components
│   ├── core/              # Tests for core music functionality
│   ├── client/            # Tests for client-side components 
│   └── server/            # Tests for server-side functionality
├── integration/           # Integration tests for API and components
│   └── api/               # API endpoint tests
├── e2e/                   # End-to-end tests with Cypress
│   └── cypress/
│       ├── specs/         # Cypress test specifications
│       └── support/       # Cypress support files
├── fixtures/              # Test fixtures and sample data
└── mocks/                 # Mocks for external dependencies
```

## Running Tests

### Prerequisites

Before running tests, make sure you have installed dependencies:

```bash
npm install
```

### Running All Tests

To run the entire test suite:

```bash
npm test
```

### Running Specific Test Types

#### Unit Tests

```bash
npm run test:unit
```

#### Integration Tests

```bash
npm run test:integration
```

#### End-to-End Tests

```bash
# Run Cypress tests in headless mode
npm run test:e2e

# Open Cypress test runner UI
npm run test:e2e:open
```

### Test Coverage

To generate test coverage reports:

```bash
npm run test:coverage
```

Coverage reports will be available in the `coverage` directory. To view the coverage report in your browser:

```bash
npm run test:coverage:view
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual components in isolation. They ensure that each function or class behaves as expected.

Key unit test areas:
- Music theory functionality (scales, chords, progressions)
- MIDI sequence manipulation
- Pattern generation (chords, basslines, drums)
- MIDI export functionality

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

Key integration test areas:
- API endpoints
- Data persistence
- Session management
- Pattern generation endpoints
- Export/import functionality

### End-to-End Tests

End-to-end tests simulate user interactions with the application using Cypress.

Key E2E test scenarios:
- Creating a new session
- Generating music patterns
- Visualizing notes in the piano roll
- Playing back generated music
- Exporting and importing session data
- Handling errors and edge cases

## Writing New Tests

### Test Naming Conventions

- **Unit tests**: `[component-name].test.js`
- **Integration tests**: `[feature-name].test.js`
- **E2E tests**: `[workflow-name].cy.js`

### Test Structure Guidelines

- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Group related tests in nested `describe` blocks
- Use beforeEach/afterEach hooks for setup and teardown

### Using Mocks and Fixtures

- Place reusable test data in `/tests/fixtures`
- Create mocks for external dependencies in `/tests/mocks`
- Use Jest's mocking capabilities for unit tests
- Use Cypress interceptors for mocking in E2E tests

## Test Migration

When moving to new project structures, follow the guidelines in the `TEST_MIGRATION.md` file at the project root to update test paths and imports.

## Best Practices

1. **Isolation**: Tests should not depend on each other
2. **Deterministic**: Tests should produce the same results every time
3. **Fast**: Keep tests, especially unit tests, running quickly
4. **Maintainable**: Keep test code clean and DRY
5. **Realistic**: Test real user scenarios in E2E tests
