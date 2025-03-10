# MIDI Song Creation Tool

An agentic framework for creating, editing, and analyzing MIDI files for songwriting and music production.

## Project Structure

This branch focuses **exclusively** on the project structure reorganization. It moves files from the flat structure to a more organized directory layout without introducing testing or linting configurations.

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

## API Documentation

The API provides endpoints for:

- Session management
- Sequence creation and modification
- Note manipulation
- Music theory operations (scales, chords, progressions)
- Pattern generation (chord progressions, arpeggios, basslines, drums)
- Sequence operations (variations, quantization, merging)

All endpoints support JSON and follow RESTful conventions.

## Claude Integration

Claude can interact with this framework to help with music creation tasks including:

- Creating chord progressions in specific keys
- Generating drum patterns in various styles
- Building arpeggios and basslines
- Applying music theory principles to compositions
- Creating variations and transformations of musical ideas

## License

MIT
