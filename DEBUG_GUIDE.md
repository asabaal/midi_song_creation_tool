# MIDI Song Creation Tool Debugging Guide

This guide provides steps for testing and debugging the MIDI Song Creation Tool.

## Quick Start

1. Make sure you've merged the cleanup PR and run the cleanup script:
   ```bash
   bash cleanup-files.sh
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node midi-api.js
   ```

4. Open your browser to [http://localhost:3003](http://localhost:3003)

## Debugging Tools

### API Test Endpoint

The tool has a test endpoint to check if the API is running correctly:
- [http://localhost:3003/api/test](http://localhost:3003/api/test)

### Debug Interface

A debug interface is available at:
- [http://localhost:3003/debug.html](http://localhost:3003/debug.html)

### Special Debug Endpoints

The following endpoints can help diagnose issues:

- List all files:
  ```
  GET /api/debug/files
  ```

- Check pattern generators:
  ```
  GET /api/debug/pattern-generators
  ```

## Common Issues

### 1. "Failed to clear notes" Error

If you encounter issues with clearing notes, check that:
- The API server is using the updated version with the DELETE endpoint
- The client is making a proper DELETE request to `/api/sessions/:sessionId/notes`

### 2. Audio Playback Issues

If notes don't play:
- Make sure your browser supports the Web Audio API
- Try clicking elsewhere on the page first (some browsers require user interaction before playing audio)
- Check the browser console for errors

### 3. UI Not Showing Notes

If notes aren't appearing in the piano roll:
- Check the API response in the browser console
- Verify that the sequence has notes (look at the log output)
- Try refreshing the page and creating a new session

## Logging

The server logs errors to:
- The console
- An `error.log` file in the project directory

## File Structure

Key files:
- `midi-api.js` - Main API server
- `midi-framework.js` - Core MIDI functionality
- `fixed-patterns.js` - Pattern generators with fixes
- `public/index.html` - Web interface
- `public/debug.html` - Debugging interface
