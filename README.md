# MIDI Song Creation Tool

[![Lint](https://github.com/asabaal/midi_song_creation_tool/actions/workflows/lint.yml/badge.svg)](https://github.com/asabaal/midi_song_creation_tool/actions/workflows/lint.yml)

An agentic framework for creating, editing, and analyzing MIDI files for songwriting and music production.

## Linting & Code Quality

This branch focuses **exclusively** on adding linting and code quality tools to the project. It includes ESLint and Prettier configuration, but does not include testing infrastructure.

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

## Code Quality

This project has comprehensive linting and code formatting:

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Linting Configuration

The project uses ESLint with the following plugins and configurations:
- eslint-config-prettier
- eslint-plugin-react
- eslint-plugin-import
- eslint-plugin-jsx-a11y

### Formatting Configuration

Code formatting is standardized using Prettier with the following rules:
- Single quotes
- 2-space indentation
- 100 character line length
- No semicolons
- Arrow parentheses as needed

### Linting Scripts

Several utility scripts are available in the `/scripts` directory:
- `fix_all_eslint.sh`: Fixes all ESLint issues
- `fix_prettier.sh`: Formats all files with Prettier
- `fix_specific_line.js`: Utility for fixing specific linting issues
- `format-code.sh`: Combined linting and formatting

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
