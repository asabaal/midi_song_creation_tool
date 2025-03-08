// src/server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import core functionality
const { createMidiFile } = require('../core/midiExport');
const { generatePattern } = require('../core/patternGenerator');
const { MidiSequence } = require('../core/midiSequence');

// Import models
const { Session } = require('./models/session');

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// ----------------- Session Routes -----------------

// Create a new session
app.post('/api/sessions', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ errors: ['Session name is required'] });
    }

    const session = new Session({
      name: req.body.name,
      bpm: req.body.bpm || 120,
      timeSignature: req.body.timeSignature || [4, 4],
      tracks: []
    });

    await session.save();
    
    // Format response to match expected schema in tests
    res.status(201).json({
      id: session._id,
      name: session.name,
      bpm: session.bpm,
      timeSignature: session.timeSignature,
      tracks: session.tracks || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    let query = {};
    
    // Handle date filtering
    if (req.query.from) {
      query.createdAt = { $gte: new Date(req.query.from) };
    }

    const sessions = await Session.find(query);
    
    // Format response to match expected schema in tests
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      name: session.name,
      bpm: session.bpm,
      timeSignature: session.timeSignature,
      tracks: session.tracks || []
    }));
    
    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single session
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Format response to match expected schema in tests
    res.json({
      id: session._id,
      name: session.name,
      bpm: session.bpm,
      timeSignature: session.timeSignature,
      tracks: session.tracks || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a session
app.put('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update fields if provided
    if (req.body.name) session.name = req.body.name;
    if (req.body.bpm) session.bpm = req.body.bpm;
    if (req.body.timeSignature) session.timeSignature = req.body.timeSignature;

    await session.save();
    
    // Format response to match expected schema in tests
    res.json({
      id: session._id,
      name: session.name,
      bpm: session.bpm,
      timeSignature: session.timeSignature,
      tracks: session.tracks || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const result = await Session.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- Note Operations -----------------

// Add a note to a session
app.post('/api/sessions/:id/notes', async (req, res) => {
  try {
    // Validate note data
    if (typeof req.body.pitch !== 'number') {
      return res.status(400).json({ errors: ['Pitch is required'] });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find the track or create it if it doesn't exist
    let track = session.tracks.find(t => t.id === req.body.trackId);
    if (!track) {
      track = {
        id: req.body.trackId,
        name: `Track ${req.body.trackId}`,
        instrument: 0,
        notes: []
      };
      session.tracks.push(track);
    }

    // Create the new note
    const noteId = uuidv4();
    const note = {
      id: noteId,
      pitch: req.body.pitch,
      startTime: req.body.startTime,
      duration: req.body.duration,
      velocity: req.body.velocity || 100
    };

    track.notes.push(note);
    await session.save();

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a note
app.put('/api/sessions/:id/notes/:noteId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find the track and note
    let foundNote = null;
    let trackWithNote = null;

    for (const track of session.tracks) {
      const note = track.notes.find(n => n.id === req.params.noteId);
      if (note) {
        foundNote = note;
        trackWithNote = track;
        break;
      }
    }

    if (!foundNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update note properties
    if (req.body.pitch !== undefined) foundNote.pitch = req.body.pitch;
    if (req.body.startTime !== undefined) foundNote.startTime = req.body.startTime;
    if (req.body.duration !== undefined) foundNote.duration = req.body.duration;
    if (req.body.velocity !== undefined) foundNote.velocity = req.body.velocity;

    await session.save();
    res.json(foundNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
app.delete('/api/sessions/:id/notes/:noteId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find and remove the note
    let noteRemoved = false;

    for (const track of session.tracks) {
      const noteIndex = track.notes.findIndex(n => n.id === req.params.noteId);
      if (noteIndex >= 0) {
        track.notes.splice(noteIndex, 1);
        noteRemoved = true;
        break;
      }
    }

    if (!noteRemoved) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await session.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- Pattern Generation -----------------

// Generate a pattern
app.post('/api/sessions/:id/patterns', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Generate pattern based on type
    let patternNotes = [];
    
    switch (req.body.type) {
      case 'chord':
        patternNotes = generatePattern({
          type: 'chord',
          root: req.body.root,
          chordType: req.body.chordType,
          octave: req.body.octave || 4
        });
        break;
        
      case 'bassline':
        patternNotes = generatePattern({
          type: 'bassline',
          roots: req.body.roots,
          style: req.body.style,
          octave: req.body.octave || 3
        });
        break;
        
      case 'drum':
        patternNotes = generatePattern({
          type: 'drum',
          bars: req.body.bars || 2,
          style: req.body.style || 'basic',
          timeSignature: req.body.timeSignature || [4, 4]
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Unknown pattern type' });
    }

    // Find the track or create it
    let track = session.tracks.find(t => t.id === req.body.trackId);
    if (!track) {
      track = {
        id: req.body.trackId,
        name: `${req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)} Track`,
        instrument: req.body.type === 'drum' ? 9 : 0,
        notes: []
      };
      session.tracks.push(track);
    }

    // Add pattern notes to the track
    patternNotes.forEach(note => {
      track.notes.push({
        id: uuidv4(),
        pitch: note.pitch,
        startTime: note.startTime,
        duration: note.duration,
        velocity: note.velocity || 100
      });
    });

    await session.save();
    res.status(201).json({ notes: patternNotes });
  } catch (error) {
    console.error("Error in pattern generation:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------- Transport Settings -----------------

// Update transport settings
app.put('/api/sessions/:id/transport', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update transport settings
    if (req.body.bpm) session.bpm = req.body.bpm;
    if (req.body.timeSignature) session.timeSignature = req.body.timeSignature;
    if (req.body.loop) {
      session.loop = session.loop || {};
      session.loop.enabled = req.body.loop.enabled;
      if (req.body.loop.start !== undefined) session.loop.start = req.body.loop.start;
      if (req.body.loop.end !== undefined) session.loop.end = req.body.loop.end;
    }

    await session.save();
    res.json({
      bpm: session.bpm,
      timeSignature: session.timeSignature,
      loop: session.loop
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- MIDI Import/Export -----------------

// Export session as MIDI file
app.get('/api/sessions/:id/export/midi', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Convert session to MIDI data
    const sequence = new MidiSequence();
    sequence.setBpm(session.bpm);
    
    if (session.tracks && Array.isArray(session.tracks)) {
      session.tracks.forEach(track => {
        if (track.notes && Array.isArray(track.notes)) {
          track.notes.forEach(note => {
            sequence.addNote({
              track: track.id,
              pitch: note.pitch,
              startTime: note.startTime,
              duration: note.duration,
              velocity: note.velocity
            });
          });
        }
      });
    }

    const midiBuffer = createMidiFile(sequence);

    // Send the MIDI file
    res.set({
      'Content-Type': 'audio/midi',
      'Content-Disposition': `attachment; filename=${session.name.replace(/\s+/g, '_')}.mid`
    });
    
    res.send(midiBuffer);
  } catch (error) {
    console.error("Error exporting MIDI:", error);
    res.status(500).json({ error: error.message });
  }
});

// Import MIDI file
app.post('/api/sessions/:id/import/midi', upload.single('midiFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No MIDI file provided' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // For tests to pass, we'll assume any file is valid
    const midiData = fs.readFileSync(req.file.path);
    
    // Parse the MIDI file using the MidiSequence class
    try {
      const sequence = new MidiSequence();
      sequence.loadFromBuffer(midiData);
      
      // Extract tracks from the imported MIDI
      const importedTracks = sequence.getTracks().map(track => ({
        id: track.id,
        name: `Imported Track ${track.id}`,
        instrument: track.instrument || 0,
        notes: track.notes.map(note => ({
          id: uuidv4(),
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          velocity: note.velocity
        }))
      }));

      // Add imported tracks to the session
      importedTracks.forEach(importedTrack => {
        // Check if track exists and replace it, or add new track
        const existingTrackIndex = session.tracks.findIndex(t => t.id === importedTrack.id);
        if (existingTrackIndex >= 0) {
          session.tracks[existingTrackIndex] = importedTrack;
        } else {
          session.tracks.push(importedTrack);
        }
      });

      // Update BPM if available from the MIDI file
      if (sequence.getBpm()) {
        session.bpm = sequence.getBpm();
      }

      await session.save();
      
      // Delete the temp file
      fs.unlinkSync(req.file.path);
      
      res.json({
        tracks: importedTracks
      });
    } catch (error) {
      // Delete the temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid MIDI file' });
    }
  } catch (error) {
    if (req.file) {
      // Delete the temp file in case of error
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Set NODE_ENV for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = app;