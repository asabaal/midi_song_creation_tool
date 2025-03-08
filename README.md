# MIDI Song Creation Tool

An agentic framework for creating and manipulating MIDI music via a web interface and API. This tool enables AI assistants like Claude to compose and edit music.

## Features

- Create chord progressions, basslines, and drum patterns
- Visualize music with a piano roll interface
- Play back MIDI sequences in the browser
- Export to standard MIDI files compatible with any DAW (Ableton, Logic, FL Studio, etc.)
- API for AI assistant integration

## Getting Started

### Prerequisites

- Node.js 16+ installed
- A modern web browser (Chrome, Firefox, Edge)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/asabaal/midi_song_creation_tool.git
   cd midi_song_creation_tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node midi-api.js
   ```

4. Open your browser to:
   ```
   http://localhost:3003
   ```

## Usage

### Web Interface

The web interface provides a simple way to:

1. Create a session
2. Generate music (chord progressions, basslines, drum patterns)
3. Play back the music
4. Visualize notes on the piano roll
5. Export to standard MIDI files

### Creating Music

1. Click "Set Up" to create a session
2. Use "Add Chord Progression", "Add Bassline", and "Add Drums" buttons to create parts
3. Click "Play" to hear your music
4. When satisfied, click "Export to MIDI" to save your song

### Export to DAW

The export feature creates standard MIDI files (.mid) compatible with:
- Ableton Live
- Logic Pro
- FL Studio
- Pro Tools
- Cubase
- GarageBand
- Any other DAW that supports MIDI

### API Endpoints

The tool provides the following key API endpoints:

- **Create a session**: `POST /api/sessions`
- **Create a sequence**: `POST /api/sessions/:sessionId/sequences`
- **Generate chord progression**: `POST /api/sessions/:sessionId/patterns/chord-progression`
- **Generate bassline**: `POST /api/sessions/:sessionId/patterns/bassline`
- **Generate drums**: `POST /api/sessions/:sessionId/patterns/drums`
- **Clear notes**: `DELETE /api/sessions/:sessionId/notes`
- **Export to MIDI**: `GET /api/sessions/:sessionId/export/midi`

See the [DEVELOPER.md](DEVELOPER.md) file for detailed API documentation.

## Debugging

If you encounter issues, see the [DEBUG_GUIDE.md](DEBUG_GUIDE.md) file for debugging tips.

Key debugging tools:
- `/debug.html` interface
- `/api/test` endpoint
- `/api/debug/files` for file system checking
- Logs in the console and error.log

## Future Plans

- More pattern generation options
- Integration with advanced AI tools
- Support for multiple simultaneous sessions
- MIDI import functionality

## License

ISC License

## Acknowledgments

- Web Audio API
- Express.js
- midi-writer-js
