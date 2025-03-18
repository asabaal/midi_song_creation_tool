# MIDI Song Creation Tool - Debug Guide

This document provides guidance for testing, debugging, and troubleshooting the MIDI Song Creation Tool after the project structure reorganization.

## Table of Contents
- [Testing the App](#testing-the-app)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Debug Endpoints](#debug-endpoints)
- [Rolling Back Changes](#rolling-back-changes)

## Testing the App

Follow these steps to verify the app is working correctly:

### Basic Setup
1. Clone the repository or pull the latest changes
2. Make sure you're on the `feature/project-structure` branch
3. Run `npm install` to ensure all dependencies are installed
4. Start the app with `npm run dev`
5. Verify the server starts on port 3003 with no errors
6. Open your browser to http://localhost:3003

### Testing Core Functionality
1. **Create a session**:
   - On the main interface, click "New Session" or equivalent button
   - Verify a session is created without errors

2. **Generate patterns**:
   - Create a chord progression
   - Create a bassline
   - Create a drum pattern
   - Verify all patterns are generated and displayed in the piano roll

3. **Playback**:
   - Play the sequence
   - Verify audio playback works for all parts
   - Check that pause/stop functionality works

4. **Export/Import**:
   - Export the sequence as MIDI
   - Export the sequence as JSON
   - Import a previously exported sequence
   - Verify all operations complete successfully

## Common Issues and Solutions

### Issue: No notes displayed in piano roll
If patterns are generated but not displayed:
1. Open browser devtools (F12) and check for errors
2. Visit http://localhost:3003/api/debug-data to verify notes are actually stored in the session
3. Check if session and sequence IDs match between requests

### Issue: Server won't start
1. Verify port 3003 isn't already in use
2. Check for syntax errors in server.js or app.js
3. Make sure all dependencies are installed

### Issue: API endpoints return 404
1. Check if you're using the correct endpoint path
2. Visit http://localhost:3003/api/debug to verify available routes

## Debug Endpoints

Several special debug endpoints are available to help diagnose issues:

- `GET /api/debug` - Shows basic server info and version
- `GET /api/debug-data` - Provides detailed information about all sessions, sequences, and notes
- `GET /api` - Lists all available API routes

## Rolling Back Changes

If you encounter issues and need to revert to a previous working state:

1. Run `node rollback.js` to see a list of recent commits
2. Choose a commit to roll back to
3. Run `node rollback.js [commit-hash]` to roll back to that specific commit

The script will automatically create a backup branch before rolling back, so you can easily restore your changes if needed.

Example:
```bash
# View recent commits
node rollback.js

# Roll back to a specific commit
node rollback.js abc1234
```

## Key Files to Check

If you need to debug specific functionality:

- `src/server/app.js` - Main Express application setup
- `src/server/server.js` - Server startup configuration
- `src/server/models/session.js` - Session model with track/sequence synchronization
- `src/server/routes/compatRouter.js` - Compatibility layer for old API routes

## Reporting Issues

If you encounter persistent issues that you can't resolve:
1. Create a detailed description of the problem
2. Include any error messages from the console
3. Describe the steps to reproduce the issue
4. Submit an issue on the GitHub repository
