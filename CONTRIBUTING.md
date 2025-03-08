# Contributing to MIDI Song Creation Tool

Thank you for your interest in contributing to the MIDI Song Creation Tool! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Coding Style](#coding-style)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. Any form of harassment or disrespectful behavior will not be tolerated.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/midi_song_creation_tool.git`
3. Add the upstream repository: `git remote add upstream https://github.com/asabaal/midi_song_creation_tool.git`
4. Install dependencies: `npm install`
5. Create a new branch for your feature: `git checkout -b feature/your-feature-name`

## Development Workflow

1. Make your changes in your feature branch
2. Run tests to ensure your changes don't break existing functionality: `npm test`
3. Run linting to ensure code style consistency: `npm run lint`
4. Format your code: `npm run format`
5. Commit your changes with a descriptive message
6. Push your branch to your fork: `git push origin feature/your-feature-name`
7. Create a pull request from your fork to the main repository

## Testing

All code contributions should include appropriate tests. The project uses:

- **Jest**: For unit and integration testing
- **Cypress**: For end-to-end testing

### Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components work together, with minimal mocking
- **End-to-End Tests**: Test full application workflows from the user's perspective

All new features should have at least:
1. Unit tests for individual functions/components
2. Integration tests if the feature interacts with other parts of the system

## Coding Style

This project uses ESLint and Prettier to enforce a consistent coding style:

- 2 spaces for indentation
- Single quotes for strings
- Semicolons at the end of statements
- Trailing commas in multi-line object/array literals

### Enforcing Style

```bash
# Check for style issues
npm run lint

# Fix style issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

## Pull Request Process

1. Ensure all tests pass and linting issues are resolved
2. Update the README.md if necessary with details of changes
3. Update any relevant documentation
4. The PR must receive approval from at least one maintainer
5. Once approved, a maintainer will merge your changes

## Commit Message Guidelines

Follow these guidelines for your commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Example:
```
Add virtual keyboard component

- Implement interactive piano keyboard
- Add mouse event handling
- Include tests for component functionality

Fixes #123
```

## Documentation

Please document your code thoroughly:

- Add JSDoc comments to all functions and classes
- Explain complex algorithms or business logic
- Update the README.md if you add or change functionality
- Create or update documentation in the `docs` directory for major features

## Questions?

If you have any questions or need help with the contribution process, please open an issue in the repository.

Thank you for contributing to the MIDI Song Creation Tool!
