# MIDI Song Creation Tool Testing Guide

This document provides a comprehensive guide to the testing infrastructure of the MIDI Song Creation Tool. It explains the different types of tests, how to run them, and how to add new tests.

## Testing Philosophy

The MIDI Song Creation Tool follows a comprehensive testing approach:

- **Unit Tests**: Ensure individual components work correctly in isolation
- **Integration Tests**: Verify components work together properly
- **End-to-End Tests**: Test entire user workflows from the UI

## Test Directory Structure

```
tests/
├── unit/                  # Unit tests with Jest
│   ├── core/              # Core module tests
│   └── client/            # Client-side component tests
├── integration/           # Integration tests
│   └── api/               # API integration tests
├── e2e/                   # End-to-end tests with Cypress
│   └── cypress/
│       ├── specs/         # Test specifications
│       ├── support/       # Support utilities
│       └── fixtures/      # Test data
└── fixtures/              # Shared test fixtures
```

## Running Tests

### All Tests

Run all tests with a single command:

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### End-to-End Tests

Run Cypress tests in headless mode:

```bash
npm run test:e2e
```

Open Cypress Test Runner for interactive testing:

```bash
npm run test:e2e:open
```

### Coverage Reports

Generate a coverage report:

```bash
npm run test:coverage
```

The coverage report will be available in the `coverage` directory. Open `coverage/lcov-report/index.html` in your browser to view it.

## Test Configuration

### Jest Configuration

The Jest configuration is in `jest.config.js`. Key settings include:

- Test environment: jsdom for browser-like testing
- Coverage thresholds
- Module name mapping

### Cypress Configuration

The Cypress configuration is in `cypress.config.js`. Key settings include:

- Base URL
- Test file patterns
- Screenshots and videos directory

## Writing New Tests

### Unit Tests

Unit tests should be small, focused, and test a single unit of functionality.

```javascript
// Example unit test
describe('MusicTheory.generateChord', () => {
  it('should generate a C major chord correctly', () => {
    const chord = MusicTheory.generateChord('C', 'major', 4);
    expect(chord).toEqual([60, 64, 67]); // C4, E4, G4
  });
});
```

### Integration Tests

Integration tests verify that components work together correctly. For API endpoints:

```javascript
// Example integration test
describe('POST /api/music-theory/analyze-chord', () => {
  it('should correctly identify a C major chord', async () => {
    const response = await request(app)
      .post('/api/music-theory/analyze-chord')
      .send({ midiNotes: [60, 64, 67] }) // C, E, G
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.type).toBe('major');
  });
});
```

### End-to-End Tests

E2E tests use Cypress to test the application from a user's perspective:

```javascript
// Example E2E test
describe('Virtual Keyboard', () => {
  it('should play notes when keys are clicked', () => {
    cy.createSession('Test Session');
    cy.get('[data-cy=keyboard-tab]').click();
    cy.get('[data-cy=virtual-keyboard] .white-key').first().click();
    cy.get('@playNoteSpy').should('have.been.calledWith', 60);
  });
});
```

## Best Practices

1. **Test IDs**: Use `data-cy` attributes for selecting elements in E2E tests
2. **Isolation**: Unit tests should be isolated and not rely on external services
3. **Fixtures**: Use fixtures for test data instead of hard-coding
4. **Coverage**: Aim for high coverage, especially for core functionality
5. **Descriptive Naming**: Use descriptive test names that explain what's being tested
6. **Assertions**: Make specific assertions about the expected outcomes
7. **CI Integration**: Tests should run automatically in CI/CD pipelines

## Common Testing Scenarios

### Testing UI Components

For React components:

1. Use React Testing Library for rendering and interacting with components
2. Focus on user interactions rather than implementation details
3. Use `data-testid` attributes for test-specific element selection

### Testing API Endpoints

1. Use supertest for API endpoint testing
2. Test both successful and error cases
3. Verify response status codes, headers, and body content

### Testing Async Code

1. Use async/await for cleaner code
2. Ensure tests wait for async operations to complete
3. Mock network requests when testing components in isolation

## Troubleshooting

### Tests Failing in CI but Not Locally

- Check for environment-specific issues
- Ensure tests don't rely on specific timings (use `cy.wait()` sparingly)
- Check for permissions issues in file operations

### Slow Tests

- Minimize unnecessary network requests
- Use mocks and stubs for external services
- Run tests in parallel when possible

### Flaky Tests

- Avoid depending on timing/animation
- Ensure proper waiting for elements/responses
- Add more specific assertions to catch issues earlier

## Continuous Integration

Tests are automatically run on:
- Pull requests to main or develop branches
- Direct pushes to protected branches

The CI configuration is in `.github/workflows/test.yml`.
