# MIDI Song Creation Tool Testing Suite

This directory contains a comprehensive testing suite for the MIDI Song Creation Tool. The testing suite is organized into several types of tests:

## Test Types

1. **Unit Tests** - Test individual functions and classes in isolation
2. **Integration Tests** - Test how components work together
3. **End-to-End Tests** - Test full application workflows

## Directory Structure

```
tests/
├── unit/                  # Unit tests
│   ├── core/              # Core module tests
│   ├── server/            # Server-side tests
│   └── client/            # Client-side tests
├── integration/           # Integration tests
│   ├── api/               # API integration tests
│   └── modules/           # Module integration tests
├── e2e/                   # End-to-end tests (Cypress)
│   └── cypress/
│       ├── specs/         # Test specifications
│       ├── support/       # Support utilities
│       ├── screenshots/   # Screenshots from test runs
│       └── videos/        # Videos from test runs
└── fixtures/              # Test fixtures and data
    ├── midi/              # MIDI file fixtures
    ├── json/              # JSON data fixtures
    └── mock-data/         # Mock data utilities
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install testing tools:

```bash
npm install --save-dev jest cypress @testing-library/react @testing-library/jest-dom supertest
```

## Running Tests

### Unit and Integration Tests

Run all tests with Jest:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Run specific test groups:

```bash
npm run test:unit       # Only unit tests
npm run test:integration # Only integration tests
```

Generate coverage report:

```bash
npm run test:coverage
```

### End-to-End Tests

Run Cypress tests headlessly:

```bash
npm run test:e2e
```

Open Cypress Test Runner for interactive testing:

```bash
npm run test:e2e:open
```

## Writing Tests

### Unit Tests

Unit tests should focus on testing individual functions and components in isolation. Mock all external dependencies.

Example:

```javascript
// tests/unit/core/someModule.test.js
const { someFunction } = require('../../../src/core/someModule');

describe('someFunction', () => {
  test('should handle valid input', () => {
    const result = someFunction('valid-input');
    expect(result).toBe(true);
  });
});
```

### Integration Tests

Integration tests should focus on how components work together. Minimize mocking to test real interactions.

Example:

```javascript
// tests/integration/api/someEndpoint.test.js
const request = require('supertest');
const app = require('../../../src/server/app');

describe('GET /api/some-endpoint', () => {
  test('should return correct data', async () => {
    const response = await request(app)
      .get('/api/some-endpoint')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### End-to-End Tests

E2E tests should test full application workflows from the user's perspective.

Example:

```javascript
// tests/e2e/cypress/specs/someWorkflow.cy.js
describe('Some workflow', () => {
  it('should complete successfully', () => {
    cy.visit('/');
    cy.get('[data-cy=some-button]').click();
    cy.url().should('include', '/next-page');
  });
});
```

## Continuous Integration

The testing suite is configured to run in CI environments. The following script can be used in CI pipelines:

```bash
npm run test:ci
```

This will:
1. Run all Jest tests with coverage
2. Run Cypress E2E tests headlessly
3. Fail if any tests fail

## Adding Test Fixtures

When adding test fixtures:

1. Place MIDI files in `tests/fixtures/midi/`
2. Place JSON data in `tests/fixtures/json/`
3. Add mock data utilities in `tests/fixtures/mock-data/`

## Best Practices

1. Keep tests small and focused on one thing
2. Use descriptive test names that explain what's being tested
3. Organize tests to match the source code structure
4. Avoid test interdependencies
5. Clean up after tests that modify global state