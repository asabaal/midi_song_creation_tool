# Migration Guide: Project Structure Changes

This document provides guidance on migrating from the previous flat project structure to the new modular directory organization.

## Overview of Changes

### Directory Structure

**Previous (Flat) Structure:**
```
midi_song_creation_tool/
├── midi-api.js
├── midi-framework.js
├── midi-exporter.js
├── fixed-patterns.js
├── package.json
└── public/
    ├── index.html
    ├── debug.html
    └── minimal.html
```

**New (Modular) Structure:**
```
midi-song-creation-tool/
├── src/
│   ├── core/
│   │   ├── midi-framework.js
│   │   ├── midiExport.js
│   │   ├── midiSequence.js
│   │   ├── musicTheory.js
│   │   └── patternGenerator.js
│   ├── server/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── routes/
│   │       ├── musicTheoryRoutes.js
│   │       ├── sessionRoutes.js
│   │       ├── patternRoutes.js
│   │       └── exportRoutes.js
│   └── client/
│       └── (future React components)
├── public/
│   ├── index.html
│   ├── debug.html
│   └── minimal.html
└── package.json
```

### Key Changes

1. **Entry Point**: Changed from `midi-api.js` to `src/server/server.js`
2. **Port Number**: Changed from 3003 to 3000 (configurable via PORT environment variable)
3. **Project Name**: Changed from `midi_song_creation_tool` to `midi-song-creation-tool` (underscore to hyphen)
4. **New Dependencies**: Added mongoose, multer, prop-types, uuid, and nodemon (dev)
5. **API Structure**: Routes organized into separate modules

## API Path Changes

### Previous vs New API Paths

| Previous Path | New Path | Description |
|---------------|----------|-------------|
| `/api/sessions` | `/api/sessions` | Create/list sessions (unchanged) |
| `/api/sessions/:id` | `/api/sessions/:id` | Get session by ID (unchanged) |
| `/api/patterns/chord-progression` | `/api/sessions/:sessionId/patterns/chord-progression` | Generate chord progression |
| `/api/patterns/bassline` | `/api/sessions/:sessionId/patterns/bassline` | Generate bassline |
| `/api/patterns/drums` | `/api/sessions/:sessionId/patterns/drums` | Generate drum pattern |
| `/api/patterns/notes/:sessionId/:trackId` | `/api/sessions/:sessionId/notes` | Clear notes |
| `/api/export/midi/:sessionId` | `/api/sessions/:sessionId/export/midi` | Export MIDI file |
| `/api/export/json/:sessionId` | `/api/sessions/:sessionId/export/json` | Export JSON |
| `/api/export/import` | `/api/sessions/:sessionId/import` | Import JSON data |

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/asabaal/midi-song-creation-tool.git
   cd midi-song-creation-tool
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Main interface: http://localhost:3000
   - Debug interface: http://localhost:3000/debug.html
   - Minimal interface: http://localhost:3000/minimal.html

## Common Issues and Solutions

### Port Conflicts

If you encounter port conflicts with the new default port (3000):

```bash
PORT=3003 npm run dev
```

### Module Import Errors

If you see errors related to missing modules, try:

```bash
# Clean install of dependencies
rm -rf node_modules
npm install
```

### API Path Not Found Errors

If you're getting 404 errors when calling API endpoints, ensure you're using the new paths as described in the API Path Changes table above.

## File-Specific Changes

### package.json

- Changed `"name"` from `"midi_song_creation_tool"` to `"midi-song-creation-tool"`
- Changed `"main"` from `"midi-api.js"` to `"src/server/server.js"`
- Added new scripts:
  - `"dev": "nodemon src/server/server.js"`
  - `"build": "echo \"No build step required for now\" && exit 0"`
- Added new dependencies:
  - `"mongoose": "^7.5.0"`
  - `"multer": "^1.4.5-lts.1"`
  - `"prop-types": "^15.8.1"`
  - `"uuid": "^9.0.0"`
- Added dev dependencies:
  - `"nodemon": "^3.0.1"`

### HTML Files

- Updated API endpoint paths in all HTML files
- Updated titles and branding in UI files

## For Contributors

If you've been working on the old structure and want to migrate your changes:

1. Identify which component your code belongs to (core, server, or client)
2. Place your files in the appropriate directory 
3. Update any import paths
4. Update any API endpoint references to match the new structure
