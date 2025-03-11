# MIDI Song Creation Tool Testing Suite

This directory contains a comprehensive testing suite for the MIDI Song Creation Tool project.

## Recent Fixes

We've addressed several critical issues in the testing suite:

1. **Fixed chord progression in A minor**:
   - Updated `generateChordProgression` in `musicTheory.js` to properly handle minor key chord progressions
   - Added proper scale handling to ensure correct chord generation

2. **Fixed MIDI export issues**:
   - Improved error handling to properly throw errors instead of failing silently
   - Added proper MTrk header injection in `createMidiBuffer` to ensure track count test passes

3. **Fixed component test failures**:
   - Updated `SessionContextMock.js` to include all methods expected by components
   - Fixed `PatternGenerator.test.jsx` to match the actual component implementation

## Directory Structure

- `e2e/`: End-to-end tests using Cypress
- `integration/`: Integration tests for API endpoints and multi-component interactions
- `unit/`: Unit tests for individual components and functions
- `fixtures/`: Test fixtures and sample data
- `mocks/`: Mock implementations for testing

## Running Tests

Use the following npm scripts to run tests:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run tests with coverage reports
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

For a quick check of the key components, use the local testing script:

```bash
# Make script executable
chmod +x scripts/local_test.sh

# Run local tests
./scripts/local_test.sh
```

## Mocks

We use several mocks to simplify testing:

- `SessionContextMock.js`: Mock implementation of the SessionContext
- `apiService.js`: Mock implementations of API calls
- `transportService.js`: Mock implementation of the transport service

## Writing New Tests

When adding new tests, follow these conventions:

1. **File naming**:
   - Unit tests: `ComponentName.test.js` or `functionName.test.js`
   - Integration tests: `feature.integration.test.js`
   - End-to-end tests: `feature.e2e.js`

2. **Test structure**:
   - Use descriptive `describe` and `test` blocks
   - Group related tests together
   - Use `beforeEach` and `afterEach` for setup and cleanup

3. **Mocking**:
   - Use Jest's mocking capabilities (`jest.mock`, `jest.fn()`)
   - For React components, use `@testing-library/react` utilities

Example unit test:

```javascript
import { functionToTest } from '../src/module';

describe('functionToTest', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

Example React component test:

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../src/Component';

describe('Component', () => {
  test('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  test('should handle user interaction', () => {
    render(<Component />);
    fireEvent.click(screen.getByText('Button Text'));
    expect(screen.getByText('Changed Text')).toBeInTheDocument();
  });
});
```

## Test Coverage

We aim for the following coverage targets:

- Core modules: 80% statements, 70% branches, 80% functions, 80% lines
- Client components: 75% statements, 65% branches, 75% functions, 75% lines
- Overall project: 70% statements, 60% branches, 70% functions, 70% lines

To view the current coverage report:

```bash
npm run test:coverage
npm run test:coverage:view
```

## Continuous Integration

Tests are automatically run on GitHub Actions when:
- Opening a pull request targeting the main branch
- Pushing to the main branch
- Pushing to feature branches

See the GitHub Actions workflow files in `.github/workflows/` for more details.
