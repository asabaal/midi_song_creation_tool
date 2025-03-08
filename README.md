# MIDI Song Creation Tool

An agentic framework for creating and manipulating MIDI music via a web interface and API. This tool enables AI assistants like Claude to compose and edit music.

## Features

- Create chord progressions, basslines, and drum patterns
- Visualize music with a piano roll interface
- Play back MIDI sequences in the browser
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

### API Endpoints

The tool provides the following key API endpoints:

- **Create a session**: `POST /api/sessions`
- **Create a sequence**: `POST /api/sessions/:sessionId/sequences`
- **Generate chord progression**: `POST /api/sessions/:sessionId/patterns/chord-progression`
- **Generate bassline**: `POST /api/sessions/:sessionId/patterns/bassline`
- **Generate drums**: `POST /api/sessions/:sessionId/patterns/drums`
- **Clear notes**: `DELETE /api/sessions/:sessionId/notes`

See the [DEVELOPER.md](DEVELOPER.md) file for detailed API documentation.

## Debugging

If you encounter issues, see the [DEBUG_GUIDE.md](DEBUG_GUIDE.md) file for debugging tips.

Key debugging tools:
- `/debug.html` interface
- `/api/test` endpoint
- `/api/debug/files` for file system checking
- Logs in the console and error.log

## Future Plans

- Export to standard MIDI files
- More pattern generation options
- Integration with AI tools
- Support for multiple simultaneous sessions

## License

ISC License

## Acknowledgments

- Web Audio API
- Express.js
