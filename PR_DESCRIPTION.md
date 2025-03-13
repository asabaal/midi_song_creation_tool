# Testing Infrastructure and Tests

This PR adds testing infrastructure and component tests.

## Changes
- Added Jest configuration
- Created test directory structure (unit, integration, e2e)
- Added component tests for key components
- Added mock objects and fixtures
- No changes to linting configuration

## How to Test
- Run `npm test` to ensure all tests pass
- Check test coverage report
- Run individual component tests using the test scripts in the `/scripts` directory

## Implementation Notes

This is the second of three PRs to improve the project:
1. Project Structure (already merged)
2. Testing Infrastructure (this PR)
3. Linting Configuration (coming next)

By separating these concerns, we make it easier to review and understand each change.

## Components Tested
- PatternGenerator
- PianoRoll
- TransportControls
- VirtualKeyboard

## Testing Structure
```
tests/
├── e2e/                  # End-to-end tests
├── fixtures/             # Test data files
├── integration/          # Integration tests 
├── mocks/                # Mock objects and services
│   ├── APIServiceMock.js
│   ├── SessionContextMock.js
│   └── TransportServiceMock.js
└── unit/                 # Unit tests
    ├── client/
    │   └── components/   # Component tests
    ├── core/             # Core logic tests
    └── server/           # Server API tests
```
