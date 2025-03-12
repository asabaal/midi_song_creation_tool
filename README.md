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

```bash
npm test
```

## Test Troubleshooting

If you encounter issues with the tests, try the following steps:

1. Make sure all dependencies are installed:
```bash
npm install
```

2. If you see Mongoose-related warnings, they're handled by the Jest configuration but can be safely ignored.

3. If you encounter SuperTest-related errors, make sure your Express app is properly configured for testing.

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
