// src/server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Import route modules
const musicTheoryRoutes = require('./routes/musicTheoryRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const patternRoutes = require('./routes/patternRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Make sessions accessible in routes
const { Session, sessions } = require('./models/session');
const { MidiSequence } = require('./models/sequence');
const { generatePattern } = require('../core/patternGenerator');
const midiExport = require('../core/midiExport');

// Create Express app
const app = express();

// Middleware
app.use(cors());

// Custom bodyParser setup with better error handling
app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      console.error(`JSON parse error: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid JSON in request body'
      });
    }
    next();
  });
});

app.use(bodyParser.urlencoded({ extended: true }));

// Direct handler for session creation - we define this FIRST before any other routes
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('Creating new session with body:', req.body);
    
    const { name, bpm, timeSignature } = req.body;
    
    const newSession = new Session();
    if (name) newSession.name = name;
    if (bpm) newSession.bpm = bpm;
    if (timeSignature) newSession.timeSignature = timeSignature;
    
    await newSession.save();
    
    console.log(`Created session with ID: ${newSession.id}`);
    
    res.status(201).json({
      success: true,
      sessionId: newSession.id,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error(`Error creating session: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Failed to create session'
    });
  }
});

// Special compatibility route for sequence creation
app.post('/api/sessions/:sessionId/sequences', (req, res) => {
  // Forward to the session routes handler
  sessionRoutes.handle(req, res);
});

// Special handler for getting sequence data
app.get('/api/sessions/:sessionId/sequences/:sequenceId', async (req, res) => {
  try {
    const { sessionId, sequenceId } = req.params;
    console.log(`Getting sequence ${sequenceId} from session ${sessionId}`);
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // First, check if the sequence exists in the sequences object
    if (session.sequences && session.sequences[sequenceId]) {
      console.log(`Found sequence in sequences object with ${session.sequences[sequenceId].notes ? session.sequences[sequenceId].notes.length : 0} notes`);
      return res.json({
        success: true,
        sequence: session.sequences[sequenceId]
      });
    }
    
    // If not found there, look for it in the tracks
    if (session.tracks) {
      const track = session.tracks.find(t => t.id === sequenceId);
      if (track) {
        console.log(`Found sequence in tracks array with ${track.notes ? track.notes.length : 0} notes`);
        // Format as a sequence
        const sequence = {
          id: track.id,
          name: track.name,
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes || []
        };
        
        // Sync it back to the sequences object for future calls
        if (!session.sequences) {
          session.sequences = {};
        }
        session.sequences[sequenceId] = sequence;
        await session.save();
        
        return res.json({
          success: true,
          sequence
        });
      }
    }
    
    // Try returning current sequence as a fallback
    if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      console.log(`Falling back to current sequence ${session.currentSequenceId}`);
      return res.json({
        success: true,
        sequence: session.sequences[session.currentSequenceId]
      });
    }
    
    // Try first track as a last resort
    if (session.tracks && session.tracks.length > 0) {
      const firstTrack = session.tracks[0];
      console.log(`Falling back to first track ${firstTrack.id} with ${firstTrack.notes ? firstTrack.notes.length : 0} notes`);
      
      const sequence = {
        id: firstTrack.id,
        name: firstTrack.name || 'Default Sequence',
        tempo: firstTrack.tempo || 120,
        timeSignature: firstTrack.timeSignature || { numerator: 4, denominator: 4 },
        key: firstTrack.key || 'C major',
        notes: firstTrack.notes || []
      };
      
      // Sync it back
      if (!session.sequences) {
        session.sequences = {};
      }
      session.sequences[firstTrack.id] = sequence;
      session.currentSequenceId = firstTrack.id;
      await session.save();
      
      return res.json({
        success: true,
        sequence
      });
    }
    
    // No sequence found
    return res.status(404).json({
      success: false,
      error: 'Sequence not found',
      message: `No sequence with ID ${sequenceId} exists in session ${sessionId}`
    });
  } catch (error) {
    console.error(`Error getting sequence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Special handler for the chord progression pattern through sessions API
app.post('/api/sessions/:sessionId/patterns/chord-progression', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Creating chord progression for session ${sessionId}`);
    
    // Merge URL parameters with body
    const requestBody = {
      ...req.body,
      sessionId: sessionId
    };
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Extract parameters
    const { 
      key = 'C', 
      octave = 4, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [4] 
    } = requestBody;
    
    // Generate chord progression pattern
    const options = {
      type: 'chord',
      root: key,
      octave: parseInt(octave),
      progression: progressionName.split('-'),
      chordType: scaleType,
      rhythmPattern: Array.isArray(rhythmPattern) ? rhythmPattern : [4]
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for chord progression in ${key}`);
    
    // Find or create the first track to store chord notes
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    if (session.tracks.length === 0) {
      // Create a new track
      track = {
        id: '1',
        name: 'Chord Progression',
        instrument: 0,
        notes: []
      };
      session.tracks.push(track);
    } else {
      // Use the first track
      track = session.tracks[0];
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    // CRITICAL: Also update the notes in the sequence object if it exists
    if (session.sequences) {
      if (track.id && session.sequences[track.id]) {
        // If the track has a corresponding sequence, update it
        console.log(`Updating sequence ${track.id} with ${notes.length} notes`);
        session.sequences[track.id].notes = track.notes;
      } else if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
        // Or update the current sequence
        console.log(`Updating current sequence ${session.currentSequenceId} with ${notes.length} notes`);
        session.sequences[session.currentSequenceId].notes = track.notes;
      } else {
        // Create a new sequence entry if one doesn't exist
        const sequenceId = track.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        track.id = sequenceId; // Ensure consistent IDs
        session.sequences[sequenceId] = {
          id: sequenceId,
          name: track.name || 'Chord Progression',
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes
        };
        session.currentSequenceId = sequenceId;
        console.log(`Created new sequence ${sequenceId} with ${notes.length} notes`);
      }
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating chord progression: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Special handler for the bassline pattern through sessions API
app.post('/api/sessions/:sessionId/patterns/bassline', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Creating bassline for session ${sessionId}`);
    
    // Merge URL parameters with body
    const requestBody = {
      ...req.body,
      sessionId: sessionId
    };
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Extract parameters
    const { 
      key = 'C', 
      octave = 3, 
      progressionName = 'I-IV-V-I', 
      scaleType = 'major', 
      rhythmPattern = [1, 0.5, 0.5] 
    } = requestBody;
    
    // Generate bassline pattern
    const options = {
      type: 'bassline',
      key: key,
      octave: parseInt(octave),
      progression: progressionName.split('-'),
      style: 'walking',
      rhythmPattern: Array.isArray(rhythmPattern) ? rhythmPattern : [1, 0.5, 0.5]
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for bassline in ${key}`);
    
    // Find or create a bass track
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    // Look for an existing bass track
    track = session.tracks.find(t => t.instrument === 32);
    
    if (!track) {
      // Create a new track if none exists
      track = {
        id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
        name: 'Bassline',
        instrument: 32,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    // CRITICAL: Also update the notes in the sequence object if it exists
    if (session.sequences) {
      if (track.id && session.sequences[track.id]) {
        // If the track has a corresponding sequence, update it
        console.log(`Updating sequence ${track.id} with ${notes.length} notes`);
        session.sequences[track.id].notes = track.notes;
      } else if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
        // Or update the current sequence
        console.log(`Updating current sequence ${session.currentSequenceId} with ${notes.length} notes`);
        session.sequences[session.currentSequenceId].notes = track.notes;
      } else {
        // Create a new sequence entry
        const sequenceId = track.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        track.id = sequenceId; // Ensure consistent IDs
        session.sequences[sequenceId] = {
          id: sequenceId,
          name: track.name || 'Bassline',
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes
        };
        session.currentSequenceId = sequenceId;
        console.log(`Created new sequence ${sequenceId} with ${notes.length} notes`);
      }
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating bassline: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Special handler for the drums pattern through sessions API
app.post('/api/sessions/:sessionId/patterns/drums', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Creating drum pattern for session ${sessionId}`);
    
    // Merge URL parameters with body
    const requestBody = {
      ...req.body,
      sessionId: sessionId
    };
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Extract parameters
    const { 
      patternType = 'basic', 
      measures = 2 
    } = requestBody;
    
    // Generate drum pattern
    const options = {
      type: 'drum',
      style: patternType,
      bars: parseInt(measures) || 2
    };
    
    const notes = generatePattern(options);
    console.log(`Generated ${notes.length} notes for ${patternType} drum pattern`);
    
    // Find or create a drum track
    if (!session.tracks) {
      session.tracks = [];
    }
    
    let track;
    // Look for an existing drum track
    track = session.tracks.find(t => t.instrument === 9);
    
    if (!track) {
      // Create a new track if none exists
      track = {
        id: session.tracks.length > 0 ? String(session.tracks.length + 1) : '1',
        name: 'Drums',
        instrument: 9,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Add notes to track
    if (!track.notes) {
      track.notes = [];
    }
    track.notes = track.notes.concat(notes);
    
    // CRITICAL: Also update the notes in the sequence object if it exists
    if (session.sequences) {
      if (track.id && session.sequences[track.id]) {
        // If the track has a corresponding sequence, update it
        console.log(`Updating sequence ${track.id} with ${notes.length} notes`);
        session.sequences[track.id].notes = track.notes;
      } else if (session.currentSequenceId && session.sequences[session.currentSequenceId]) {
        // Or update the current sequence
        console.log(`Updating current sequence ${session.currentSequenceId} with ${notes.length} notes`);
        session.sequences[session.currentSequenceId].notes = track.notes;
      } else {
        // Create a new sequence entry
        const sequenceId = track.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        track.id = sequenceId; // Ensure consistent IDs
        session.sequences[sequenceId] = {
          id: sequenceId,
          name: track.name || 'Drums',
          tempo: track.tempo || 120,
          timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
          key: track.key || 'C major',
          notes: track.notes
        };
        session.currentSequenceId = sequenceId;
        console.log(`Created new sequence ${sequenceId} with ${notes.length} notes`);
      }
    }
    
    await session.save();
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      sessionId: session._id,
      currentSequenceId: track.id,
      noteCount: track.notes.length
    });
  } catch (error) {
    console.error(`Error generating drum pattern: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Special handler for MIDI export
app.get('/api/sessions/:sessionId/export/midi', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        message: 'Session ID is required'
      });
    }
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Generate MIDI file
    const midiData = await midiExport.sessionToMidiFile(session);
    
    // Set response headers for file download
    const filename = (session.name || 'midi_export').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mid';
    res.setHeader('Content-Type', 'audio/midi');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', midiData.length);
    
    // Send the MIDI file data
    res.send(midiData);
  } catch (error) {
    console.error(`Error exporting MIDI: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to export MIDI',
      message: error.message
    });
  }
});

// Special handler for clearing notes
app.delete('/api/sessions/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Check if there are tracks
    if (!session.tracks || session.tracks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No tracks to clear',
        message: 'No tracks found in the session to clear notes from'
      });
    }
    
    // Clear notes from all tracks
    let totalNotes = 0;
    for (const track of session.tracks) {
      totalNotes += track.notes ? track.notes.length : 0;
      track.notes = [];
      
      // Also clear the corresponding sequence if it exists
      if (session.sequences && track.id && session.sequences[track.id]) {
        session.sequences[track.id].notes = [];
      }
    }
    
    // Also clear the current sequence if it exists
    if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      session.sequences[session.currentSequenceId].notes = [];
    }
    
    await session.save();
    
    return res.json({
      success: true,
      message: `Cleared ${totalNotes} notes from all tracks`,
      currentSequenceId: session.tracks[0].id
    });
  } catch (error) {
    console.error(`Error clearing notes: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Special handler for exporting JSON
app.get('/api/sessions/:sessionId/export/json', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Check if there are tracks
    if (!session.tracks || session.tracks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No tracks to export',
        message: 'No tracks found in the session to export'
      });
    }
    
    // Prefer the current sequence if it exists
    if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      const sequence = session.sequences[session.currentSequenceId];
      
      return res.json({
        success: true,
        message: `Exported sequence ${sequence.id} as JSON`,
        sequenceId: sequence.id,
        noteCount: sequence.notes ? sequence.notes.length : 0,
        data: sequence
      });
    }
    
    // Use the first track as the sequence data
    const track = session.tracks[0];
    
    // Format the data similar to the original API
    const sequenceData = {
      id: track.id,
      name: track.name,
      tempo: track.tempo || 120,
      timeSignature: track.timeSignature || { numerator: 4, denominator: 4 },
      key: track.key || 'C major',
      notes: track.notes || []
    };
    
    res.json({
      success: true,
      message: `Exported sequence ${track.id} as JSON`,
      sequenceId: track.id,
      noteCount: track.notes ? track.notes.length : 0,
      data: sequenceData
    });
  } catch (error) {
    console.error(`Error exporting JSON: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Special handler for importing sequences
app.post('/api/sessions/:sessionId/import', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, data } = req.body;
    
    console.log('Import data received:');
    console.log('Body keys:', Object.keys(req.body));
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // Try to import the sequence
    try {
      // Safely handle various input formats
      let jsonData;
      
      if (data) {
        // If data is already parsed
        if (typeof data === 'object') {
          jsonData = data;
        } 
        // If data is a string, parse it
        else if (typeof data === 'string') {
          try {
            jsonData = JSON.parse(data);
          } catch (e) {
            console.error('Failed to parse JSON string:', e);
            throw new Error(`Invalid JSON format: ${e.message}`);
          }
        }
        else {
          throw new Error('Import data is neither a string nor an object');
        }
      } else {
        // If data is not in the expected field, try the whole body
        jsonData = req.body;
      }
      
      console.log('Importing data with keys:', Object.keys(jsonData || {}));
      
      // Handle nested data structure
      if (jsonData.data) {
        jsonData = jsonData.data;
      }
      
      // Create a new sequence format
      const sequence = {
        id: jsonData.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        name: jsonData.name || name || 'Imported Sequence',
        tempo: jsonData.tempo || 120,
        timeSignature: jsonData.timeSignature || { numerator: 4, denominator: 4 },
        key: jsonData.key || 'C major',
        notes: jsonData.notes || []
      };
      
      // Store in both places for compatibility
      // 1. In the sequences object
      if (!session.sequences) {
        session.sequences = {};
      }
      session.sequences[sequence.id] = sequence;
      session.currentSequenceId = sequence.id;
      
      // 2. In the tracks array
      if (!session.tracks) {
        session.tracks = [];
      }
      
      // Look for existing track with this ID or create new
      let trackIndex = session.tracks.findIndex(t => t.id === sequence.id);
      if (trackIndex === -1) {
        // Add as a new track
        session.tracks.push({
          id: sequence.id,
          name: sequence.name,
          tempo: sequence.tempo,
          timeSignature: sequence.timeSignature,
          key: sequence.key,
          notes: sequence.notes,
          instrument: 0 // Default instrument
        });
      } else {
        // Update existing track
        session.tracks[trackIndex] = {
          ...session.tracks[trackIndex],
          name: sequence.name,
          tempo: sequence.tempo,
          timeSignature: sequence.timeSignature,
          key: sequence.key,
          notes: sequence.notes
        };
      }
      
      // Save session
      await session.save();
      
      res.json({
        success: true,
        message: `Imported sequence ${sequence.id} with ${sequence.notes.length} notes`,
        sequenceId: sequence.id,
        sequence: {
          id: sequence.id,
          name: sequence.name,
          tempo: sequence.tempo,
          key: sequence.key,
          noteCount: sequence.notes.length
        }
      });
    } catch (error) {
      console.error(`Error importing sequence: ${error.message}`);
      res.status(400).json({
        success: false,
        error: 'Failed to import sequence',
        message: error.message
      });
    }
  } catch (error) {
    console.error(`Error in import endpoint: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API routes - these must come AFTER any special route handlers
app.use('/api/music-theory', musicTheoryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/export', exportRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../public')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });
} else {
  // In development, always serve static files
  app.use(express.static(path.join(__dirname, '../../public')));
  
  // Simple route for development API testing
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'MIDI Song Creation Tool API',
      routes: [
        '/api/sessions',
        '/api/music-theory',
        '/api/patterns',
        '/api/export'
      ],
      activeSessions: sessions.size
    });
  });
  
  // Special debug route
  app.get('/api/debug', (req, res) => {
    res.json({
      message: 'Debug information',
      environment: process.env.NODE_ENV || 'development',
      versions: {
        node: process.version,
        app: '0.2.0'
      },
      activeSessions: sessions.size
    });
  });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  // Logger should be used instead of console in production
  // eslint-disable-next-line no-console
  console.error('Global error handler:');
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

module.exports = app;
