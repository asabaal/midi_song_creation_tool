# MIDI Song Creation Tool

A simple web-based tool for creating and experimenting with MIDI music. Create chord progressions, basslines, and drum patterns, then export them for use in your favorite DAW.

This framework provides a robust set of tools for working with MIDI data programmatically, including core modules for music theory, note manipulation, pattern generation, and sequence operations.

## Features

- **Easy-to-use web interface** - Create music with just a few clicks
- **Pattern generation** - Create chord progressions, basslines, and drum patterns automatically
- **Real-time playback** - Hear your creations instantly in the browser
- **Visual piano roll** - See your notes on a piano roll interface
- **Export to MIDI** - Export your creations as standard MIDI files to use in any DAW
- **Export as JSON** - Export your sequences as JSON for sharing or importing later
- **Import functionality** - Import previously exported sequences to continue editing

## Project Structure

This project is organized with a clean directory structure:

1. **Core Library** (`src/core`): Handles note creation, manipulation and basic music theory
2. **Server** (`src/server`): Provides structured API endpoints
3. **Web Interface** (`public`): Simple UI for testing and visualization

> **Note:** If you're migrating from the previous version, please see the [Migration Guide](MIGRATION.md) for details on the new structure and API changes.

## Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/asabaal/midi-song-creation-tool.git
   cd midi-song-creation-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. For development mode with auto-restart:
   ```bash
   npm run dev
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

4. Use the interface to create music:
   - Click "Set Up" to create a session and sequence
   - Add chord progressions, basslines, and drum patterns
   - Use the Play button to hear your creation
   - Export to MIDI or JSON when ready

## Import/Export Functionality

### Exporting Your Music

The tool offers two export formats:

1. **MIDI File (.mid)** - Standard MIDI files can be opened in any DAW such as:
   - Ableton Live
   - Logic Pro
   - FL Studio
   - GarageBand
   - Pro Tools
   - And more!

2. **JSON Format** - A text-based format for:
   - Sharing with others who use this tool
   - Backing up your work
   - Importing later to continue editing

To export:
- Create some music (chord progression, bassline, drums)
- Click either "Export to MIDI File" or "Export as JSON"
- For JSON exports, you can copy the data or save it as a file

### Importing Music

To import previously exported JSON data:
1. Click "Import"
2. Either:
   - Paste the JSON data into the text area, or
   - Use the file input to upload a JSON file
3. Click "Process Import"

## API Endpoints

The tool exposes a RESTful API for programmatic access. Here are the key endpoints:

### Session Management
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId` - Get session info

### Sequence Management
- `POST /api/sessions/:sessionId/sequences` - Create a new sequence
- `GET /api/sessions/:sessionId/sequences/:sequenceId` - Get sequence details

### Pattern Generation
- `POST /api/sessions/:sessionId/patterns/chord-progression` - Generate chord progression
- `POST /api/sessions/:sessionId/patterns/bassline` - Generate bassline
- `POST /api/sessions/:sessionId/patterns/drums` - Generate drum pattern

### Note Management
- `DELETE /api/sessions/:sessionId/notes` - Clear all notes from current sequence

### Import/Export
- `GET /api/sessions/:sessionId/export/midi` - Export current sequence as MIDI file
- `GET /api/sessions/:sessionId/export/json` - Export current sequence as JSON
- `POST /api/sessions/:sessionId/import` - Import sequence from JSON data

## Debugging

If you encounter issues:
- Check the server console for error messages
- Try the debug interface: http://localhost:3000/debug.html
- Review the error.log file for detailed error information

## Next Steps for Development

- Adding more pattern types (arpeggios, melodies)
- Improving the piano roll with editing capabilities
- Supporting MIDI input devices
- Adding more instrument sounds for playback
- Integration with external tools and services

## License

MIT
