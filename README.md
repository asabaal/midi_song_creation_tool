# MIDI Song Creation Tool

A full-featured MIDI song creation tool with piano roll, pattern generators, and more.

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

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

### Running Tests

Use the provided script to run tests with better configuration:

```bash
chmod +x run-tests.sh
./run-tests.sh
```

Or run using npm:

```bash
npm test
```

## Test Troubleshooting

If you encounter issues with the tests, try the following steps:

1. Make sure all dependencies are installed:
```bash
npm install
```

2. If you see duplicate mock warnings, use the provided script instead:
```bash
./run-tests.sh
```

3. For API test failures, make sure the mock server is being properly initialized. Check that you're using the API routes correctly in your tests.

4. For React component test failures, ensure you're importing the testing-library utilities correctly and using them as expected.

## API Documentation

The MIDI Song Creation Tool offers a comprehensive API for interacting with MIDI sequences:

- `/api/sessions` - Session management (CRUD)
- `/api/sessions/:id/notes` - Note manipulation
- `/api/sessions/:id/patterns` - Pattern generation
- `/api/music-theory` - Music theory utilities
- `/api/export` - Import/export functionality

## Tech Stack

- **Frontend:** React
- **Backend:** Express.js, Node.js
- **Database:** MongoDB with Mongoose
- **Music Processing:** Tone.js, MIDI-Writer-js
- **Testing:** Jest, React Testing Library, SuperTest

## Project Structure

- `src/client`: React frontend
- `src/server`: Express.js backend
- `src/core`: Core music processing functionality
- `tests`: Test suite (unit and integration tests)

## License

MIT
