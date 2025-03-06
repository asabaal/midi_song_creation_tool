# MIDI Song Creation Tool - Developer Guide

This document provides technical information for developers who want to understand, modify, or extend the MIDI Song Creation Tool.

## Architecture Overview

The application consists of three main components:

1. **MIDI Framework (midi-framework.js)**: Core music theory, note handling, and sequence operations
2. **API Layer (midi-api.js)**: RESTful API endpoints built with Express
3. **Web Interface (public/index.html)**: Frontend UI built with HTML, CSS, and JavaScript

![Architecture Diagram](https://via.placeholder.com/800x400?text=Architecture+Diagram)

## Core Modules

### Music Theory

The `MusicTheory` module provides:
- Scale and chord definitions
- Note name and number conversion
- Chord progression generation

```javascript
// Example: Generate a C major scale
const cMajorScale = MusicTheory.generateScale('C', 4, 'major');
// Returns: [60, 62, 64, 65, 67, 69, 71]

// Example: Generate a C major chord
const cMajorChord = MusicTheory.generateChord('C', 4, 'major');
// Returns: [60, 64, 67]
```

### MIDI Note

The `MidiNote` class represents individual notes with:
- Pitch (MIDI note number)
- Start time (in beats)
- Duration (in beats)
- Velocity (0-127)
- Channel (0-15)

```javascript
// Example: Create a middle C quarter note
const note = new MidiNote(60, 0, 1, 80, 0);
```

### MIDI Sequence

The `MidiSequence` class manages collections of notes with:
- Note addition/removal
- Sequence properties (tempo, key, time signature)
- Range and duration calculations

```javascript
// Example: Create a sequence and add notes
const sequence = new MidiSequence({ 
  tempo: 120, 
  key: 'C major' 
});
sequence.addNote(new MidiNote(60, 0, 1));
sequence.addNote(new MidiNote(64, 1, 1));
```

### Pattern Generators

The `PatternGenerators` module creates various musical patterns:
- Chord progressions
- Basslines
- Arpeggios
- Drum patterns

```javascript
// Example: Create a drum pattern
const drumNotes = PatternGenerators.createDrumPattern('basic', 2);
```

### Sequence Operations

The `SequenceOperations` module provides tools to:
- Merge sequences
- Quantize note timing
- Create variations
- Change rhythms

```javascript
// Example: Quantize a sequence to 16th notes
const quantized = SequenceOperations.quantizeSequence(sequence, 0.25);
```

## API Endpoints

The API provides RESTful endpoints for:

### Session Management
- `POST /api/sessions`: Create new session
- `GET /api/sessions/:sessionId`: Get session info
- `DELETE /api/sessions/:sessionId`: Delete session

### Sequence Management
- `POST /api/sessions/:sessionId/sequences`: Create new sequence
- `GET /api/sessions/:sessionId/sequences/:sequenceId`: Get sequence
- `PUT /api/sessions/:sessionId/sequences/:sequenceId`: Update sequence
- `DELETE /api/sessions/:sessionId/sequences/:sequenceId`: Delete sequence

### Pattern Generation
- `POST /api/sessions/:sessionId/patterns/chord-progression`
- `POST /api/sessions/:sessionId/patterns/bassline`
- `POST /api/sessions/:sessionId/patterns/arpeggio`
- `POST /api/sessions/:sessionId/patterns/drums`

### Examples

#### Creating a Session
```javascript
fetch('http://localhost:3002/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(response => response.json())
.then(data => console.log('Session created:', data.sessionId));
```

#### Generating a Chord Progression
```javascript
fetch(`http://localhost:3002/api/sessions/${sessionId}/patterns/chord-progression`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'C',
    progressionName: '1-4-5',
    scaleType: 'major',
    octave: 4
  })
})
.then(response => response.json())
.then(data => console.log('Chord progression created:', data));
```

## Frontend Structure

The web interface is built with vanilla JavaScript and Bootstrap, with the following components:

### Main UI Elements
- Sequence list and properties panel
- Tab-based interface (Piano Roll, Pattern Generator, Tools, JSON)
- Transport controls (Play, Stop, Clear)

### Piano Roll
- Visual grid for note editing
- Vertical axis = pitch
- Horizontal axis = time

### Pattern Generator
- Forms for different pattern types
- Dynamic UI that changes based on pattern selection

### Interaction Flow
1. User creates or selects a session
2. User creates a sequence or selects existing one
3. User interacts with piano roll or pattern generators
4. User can play back created sequences
5. User can apply operations via tools tab

## Common Issues and Solutions

### Server Connection Issues
- Ensure correct port (3002 for fixed-midi-api.js)
- Check for CORS issues if accessing from a different origin
- Verify server is running and has no startup errors

### Module Import Problems
- Missing or incorrect path to midi-framework.js
- Error handling in fixed-midi-api.js prevents crashes

### Pattern Generation Failures
- Check for valid session and sequence IDs
- Verify the pattern parameters are within expected ranges
- Look for error responses in network tab of browser inspector

## Extending the Framework

### Adding a New Pattern Type
1. Add pattern generation function to `PatternGenerators` in midi-framework.js
2. Create API endpoint in midi-api.js
3. Add UI form in public/index.html
4. Add event handling in the JavaScript section

### Adding New Music Theory Features
1. Extend `MusicTheory` module in midi-framework.js
2. Expose through API if needed
3. Update UI to support new features

### Adding Export Formats
1. Enhance `MidiExporter` module in midi-framework.js
2. Create new endpoint in midi-api.js
3. Add UI controls for the new export format

## Performance Considerations

- Large sequences (1000+ notes) may cause UI lag
- Server response times increase with sequence complexity
- Consider pagination for large sequences
- Use caching for repeated operations

## Testing

Manual testing can be performed using the web interface or API testing tools like Postman.

Example test flow:
1. Create a session
2. Create a sequence
3. Generate various patterns
4. Apply operations
5. Export and verify results

## Future Development Ideas

- Add a proper MIDI export using jsmidigen
- Implement more advanced pattern generation algorithms
- Add audio synthesis with more realistic instrument samples
- Create a plugin system for custom pattern generators
- Add collaborative editing features

## Getting Help

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check server logs for backend errors
3. Use the `/api/debug/files` endpoint to verify file availability
4. Try the test server with `node test-server.js`
