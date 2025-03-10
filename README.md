# MIDI Song Creation Tool

[![Test Suite](https://github.com/asabaal/midi_song_creation_tool/actions/workflows/test.yml/badge.svg)](https://github.com/asabaal/midi_song_creation_tool/actions/workflows/test.yml)

An agentic framework for creating, editing, and analyzing MIDI files for songwriting and music production.

## Testing Infrastructure

This branch focuses **exclusively** on adding testing infrastructure to the project. It includes Jest configuration, test files, and test utilities without introducing linting or code style changes.

## Overview

This framework provides a robust set of tools for working with MIDI data programmatically. It includes core modules for music theory, note manipulation, pattern generation, and sequence operations.

## Features

- Creating and manipulating MIDI note sequences
- Working with musical scales, chords, and progressions
- Generating rhythmic patterns for different instruments
- Exporting/importing standard MIDI files
- API for Claude to access programmatically

## Components

The framework consists of these main components:

1. **Core Library** (`src/core`): Handles note creation, manipulation and basic music theory
2. **Server** (`src/server`): Provides structured API endpoints for Claude to interact with
3. **Web Interface** (`public`): Simple UI for human testing and visualization

## Testing

This project includes a comprehensive testing suite:

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

# Run tests with watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Local Testing Script

For a complete verification of your code before pushing changes, use the local testing script:

```bash
# Make the script executable
chmod +x scripts/local_test.sh

# Run the local test
./scripts/local_test.sh
```

This script will:
- Verify your Node.js installation
- Install dependencies if needed
- Run all test suites
- Check test coverage against required thresholds
- Build the project to verify everything compiles correctly

### Testing Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and module interactions
- **End-to-End Tests**: Test full application workflows using Cypress

For more details about the testing suite, see the [tests/README.md](tests/README.md) file.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

4. **Access the UI**: Open `http://localhost:3000` in your browser

## License

MIT
