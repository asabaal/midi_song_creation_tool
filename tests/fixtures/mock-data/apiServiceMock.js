// tests/fixtures/mock-data/apiServiceMock.js
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { v4 as uuidv4 } from 'uuid';

// Sample session data
const sessions = [
  {
    id: 'session-1',
    name: 'Mock Session 1',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [
      {
        id: 0,
        name: 'Piano',
        instrument: 0,
        notes: [
          { id: 'note-1', pitch: 60, startTime: 0, duration: 1, velocity: 100 },
          { id: 'note-2', pitch: 64, startTime: 1, duration: 1, velocity: 100 },
        ]
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'session-2',
    name: 'Mock Session 2',
    bpm: 100,
    timeSignature: [3, 4],
    tracks: [],
    createdAt: new Date().toISOString()
  }
];

// Define mock request handlers
const handlers = [
  // Get all sessions
  rest.get('/api/sessions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(sessions)
    );
  }),
  
  // Get a specific session
  rest.get('/api/sessions/:id', (req, res, ctx) => {
    const { id } = req.params;
    const session = sessions.find(s => s.id === id);
    
    if (!session) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(session)
    );
  }),
  
  // Create a new session
  rest.post('/api/sessions', (req, res, ctx) => {
    const newSession = {
      id: `session-${sessions.length + 1}`,
      ...req.body,
      tracks: req.body.tracks || [],
      createdAt: new Date().toISOString()
    };
    
    sessions.push(newSession);
    
    return res(
      ctx.status(201),
      ctx.json(newSession)
    );
  }),
  
  // Update a session
  rest.put('/api/sessions/:id', (req, res, ctx) => {
    const { id } = req.params;
    const sessionIndex = sessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...req.body
    };
    
    sessions[sessionIndex] = updatedSession;
    
    return res(
      ctx.status(200),
      ctx.json(updatedSession)
    );
  }),
  
  // Delete a session
  rest.delete('/api/sessions/:id', (req, res, ctx) => {
    const { id } = req.params;
    const sessionIndex = sessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    sessions.splice(sessionIndex, 1);
    
    return res(
      ctx.status(204)
    );
  }),
  
  // Add a note
  rest.post('/api/sessions/:id/notes', (req, res, ctx) => {
    const { id } = req.params;
    const session = sessions.find(s => s.id === id);
    
    if (!session) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    const { trackId, pitch, startTime, duration, velocity } = req.body;
    
    // Find or create the track
    let track = session.tracks.find(t => t.id === trackId);
    if (!track) {
      track = {
        id: trackId,
        name: `Track ${trackId}`,
        instrument: 0,
        notes: []
      };
      session.tracks.push(track);
    }
    
    // Create the note
    const newNote = {
      id: uuidv4(),
      pitch,
      startTime,
      duration,
      velocity
    };
    
    track.notes.push(newNote);
    
    return res(
      ctx.status(201),
      ctx.json(newNote)
    );
  }),
  
  // Update a note
  rest.put('/api/sessions/:sessionId/notes/:noteId', (req, res, ctx) => {
    const { sessionId, noteId } = req.params;
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    // Find the note in any track
    let foundNote = null;
    let trackWithNote = null;
    
    for (const track of session.tracks) {
      const noteIndex = track.notes.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        foundNote = track.notes[noteIndex];
        trackWithNote = track;
        
        // Update the note
        track.notes[noteIndex] = {
          ...foundNote,
          ...req.body
        };
        
        break;
      }
    }
    
    if (!foundNote) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Note not found' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(trackWithNote.notes.find(n => n.id === noteId))
    );
  }),
  
  // Delete a note
  rest.delete('/api/sessions/:sessionId/notes/:noteId', (req, res, ctx) => {
    const { sessionId, noteId } = req.params;
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    // Find and remove the note from any track
    let noteRemoved = false;
    
    for (const track of session.tracks) {
      const noteIndex = track.notes.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        track.notes.splice(noteIndex, 1);
        noteRemoved = true;
        break;
      }
    }
    
    if (!noteRemoved) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Note not found' })
      );
    }
    
    return res(
      ctx.status(204)
    );
  }),
  
  // Generate pattern
  rest.post('/api/sessions/:id/patterns', (req, res, ctx) => {
    const { id } = req.params;
    const session = sessions.find(s => s.id === id);
    
    if (!session) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    const { type, trackId } = req.body;
    
    // Generate mock notes based on the pattern type
    let notes = [];
    
    if (type === 'chord') {
      const { root, chordType, octave } = req.body;
      
      // Mock a chord based on the root note (C = 60, D = 62, etc.)
      const rootPitch = {
        'C': 60, 'C#': 61, 'D': 62, 'D#': 63, 'E': 64, 'F': 65,
        'F#': 66, 'G': 67, 'G#': 68, 'A': 69, 'A#': 70, 'B': 71
      }[root] || 60;
      
      // Adjust for octave
      const basePitch = rootPitch + ((octave || 4) - 4) * 12;
      
      // Generate notes based on chord type
      if (chordType === 'major') {
        notes = [
          { id: uuidv4(), pitch: basePitch, startTime: 0, duration: 1, velocity: 100 },
          { id: uuidv4(), pitch: basePitch + 4, startTime: 0, duration: 1, velocity: 100 },
          { id: uuidv4(), pitch: basePitch + 7, startTime: 0, duration: 1, velocity: 100 }
        ];
      } else if (chordType === 'minor') {
        notes = [
          { id: uuidv4(), pitch: basePitch, startTime: 0, duration: 1, velocity: 100 },
          { id: uuidv4(), pitch: basePitch + 3, startTime: 0, duration: 1, velocity: 100 },
          { id: uuidv4(), pitch: basePitch + 7, startTime: 0, duration: 1, velocity: 100 }
        ];
      }
    } else if (type === 'bassline') {
      const { style } = req.body;
      
      // Mock a simple bassline
      notes = [
        { id: uuidv4(), pitch: 36, startTime: 0, duration: 0.5, velocity: 100 },
        { id: uuidv4(), pitch: 43, startTime: 1, duration: 0.5, velocity: 90 },
        { id: uuidv4(), pitch: 41, startTime: 2, duration: 0.5, velocity: 95 },
        { id: uuidv4(), pitch: 38, startTime: 3, duration: 0.5, velocity: 100 }
      ];
    } else if (type === 'drum') {
      const { style, bars } = req.body;
      
      // Generate a basic drum pattern for the specified number of bars
      const numBars = parseInt(bars) || 1;
      
      // Mock a drum pattern (kick on 1 & 3, snare on 2 & 4, hi-hats on 8th notes)
      notes = [];
      
      for (let bar = 0; bar < numBars; bar++) {
        // Kick drum
        notes.push({ id: uuidv4(), pitch: 36, startTime: bar * 4 + 0, duration: 0.25, velocity: 100 });
        notes.push({ id: uuidv4(), pitch: 36, startTime: bar * 4 + 2, duration: 0.25, velocity: 100 });
        
        // Snare drum
        notes.push({ id: uuidv4(), pitch: 38, startTime: bar * 4 + 1, duration: 0.25, velocity: 90 });
        notes.push({ id: uuidv4(), pitch: 38, startTime: bar * 4 + 3, duration: 0.25, velocity: 90 });
        
        // Hi-hat
        for (let i = 0; i < 8; i++) {
          notes.push({ id: uuidv4(), pitch: 42, startTime: bar * 4 + i * 0.5, duration: 0.25, velocity: 80 });
        }
      }
    }
    
    return res(
      ctx.status(201),
      ctx.json({ notes })
    );
  }),
  
  // Update transport
  rest.put('/api/sessions/:id/transport', (req, res, ctx) => {
    const { id } = req.params;
    const sessionIndex = sessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    const { bpm, timeSignature, loop } = req.body;
    
    if (bpm !== undefined) {
      sessions[sessionIndex].bpm = bpm;
    }
    
    if (timeSignature !== undefined) {
      sessions[sessionIndex].timeSignature = timeSignature;
    }
    
    if (loop !== undefined) {
      sessions[sessionIndex].loop = loop;
    }
    
    return res(
      ctx.status(200),
      ctx.json(sessions[sessionIndex])
    );
  }),
  
  // Export MIDI
  rest.get('/api/sessions/:id/export/midi', (req, res, ctx) => {
    const { id } = req.params;
    const session = sessions.find(s => s.id === id);
    
    if (!session) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Session not found' })
      );
    }
    
    // Return a mock binary MIDI file (just a Buffer with some data)
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'audio/midi'),
      ctx.set('Content-Disposition', `attachment; filename="${session.name}.mid"`),
      ctx.body(new ArrayBuffer(100)) // Mock MIDI data
    );
  })
];

// Create the mock server
const server = setupServer(...handlers);

export { server, sessions };