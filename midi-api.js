// MIDI Song Creation Tool - API Layer
// This implements the API endpoints for Claude to interact with the MIDI framework

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import the MIDI framework
const { 
  MusicTheory, 
  MidiNote, 
  MidiSequence, 
  PatternGenerators, 
  SequenceOperations, 
  Session, 
  MidiExporter 
} = require('./midi-framework');

// Create Express application
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Store active sessions
const sessions = new Map();

// ==================
// SESSION MANAGEMENT
// ==================

// Create a new session
app.post('/api/sessions', (req, res) => {
  const sessionId = req.body.sessionId || `session_${Date.now()}`;
  
  // Check if session already exists
  if (sessions.has(sessionId)) {
    return res.status(409).json({
      success: false,
      error: 'Session already exists',
      message: `A session with ID ${sessionId} already exists`
    });
  }
  
  // Create new session
  const session = new Session(sessionId);
  sessions.set(sessionId, session);
  
  res.status(201).json({
    success: true,
    sessionId: session.id,
    created: session.created,
    message: 'Session created successfully'
  });
});

// Get session info
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  res.json({
    success: true,
    session: {
      id: session.id,
      created: session.created,
      currentSequenceId: session.currentSequenceId,
      sequences: session.listSequences()
    }
  });
});

// Delete a session
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Remove session
  sessions.delete(sessionId);
  
  res.json({
    success: true,
    message: `Session ${sessionId} deleted successfully`
  });
});

// =====================
// SEQUENCE MANAGEMENT
// =====================

// Create a new sequence
app.post('/api/sessions/:sessionId/sequences', (req, res) => {
  const { sessionId } = req.params;
  const { name, tempo, timeSignature, key } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Create sequence with provided options
  const sequence = session.createSequence({
    name: name || 'Untitled Sequence',
    tempo: tempo || 120,
    timeSignature: timeSignature || { numerator: 4, denominator: 4 },
    key: key || 'C major'
  });
  
  res.status(201).json({
    success: true,
    sequenceId: sequence.id,
    message: 'Sequence created successfully',
    sequence: {
      id: sequence.id,
      name: sequence.name,
      tempo: sequence.tempo,
      timeSignature: sequence.timeSignature,
      key: sequence.key
    }
  });
});

// Get a sequence
app.get('/api/sessions/:sessionId/sequences/:sequenceId', (req, res) => {
  const { sessionId, sequenceId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Try to get the sequence
  try {
    const sequence = session.getSequence(sequenceId);
    
    res.json({
      success: true,
      sequence: sequence.toJSON()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Sequence not found',
      message: error.message
    });
  }
});

// Update a sequence
app.put('/api/sessions/:sessionId/sequences/:sequenceId', (req, res) => {
  const { sessionId, sequenceId } = req.params;
  const { name, tempo, timeSignature, key } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Try to update the sequence
  try {
    const sequence = session.updateSequence(sequenceId, {
      name, tempo, timeSignature, key
    });
    
    res.json({
      success: true,
      message: 'Sequence updated successfully',
      sequence: {
        id: sequence.id,
        name: sequence.name,
        tempo: sequence.tempo,
        timeSignature: sequence.timeSignature,
        key: sequence.key
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Sequence not found',
      message: error.message
    });
  }
});

// Delete a sequence
app.delete('/api/sessions/:sessionId/sequences/:sequenceId', (req, res) => {
  const { sessionId, sequenceId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Try to delete the sequence
  try {
    session.deleteSequence(sequenceId);
    
    res.json({
      success: true,
      message: `Sequence ${sequenceId} deleted successfully`
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Sequence not found',
      message: error.message
    });
  }
});

// Set current sequence
app.post('/api/sessions/:sessionId/current-sequence', (req, res) => {
  const { sessionId } = req.params;
  const { sequenceId } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Try to set current sequence
  try {
    const sequence = session.setCurrentSequence(sequenceId);
    
    res.json({
      success: true,
      message: `Current sequence set to ${sequenceId}`,
      currentSequence: {
        id: sequence.id,
        name: sequence.name,
        tempo: sequence.tempo,
        timeSignature: sequence.timeSignature,
        key: sequence.key
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Sequence not found',
      message: error.message
    });
  }
});

// ==================
// NOTE MANAGEMENT
// ==================

// Add notes to current sequence
app.post('/api/sessions/:sessionId/notes', (req, res) => {
  const { sessionId } = req.params;
  const { notes } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Check if notes array is provided
  if (!Array.isArray(notes)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid notes format',
      message: 'Notes must be provided as an array'
    });
  }
  
  try {
    // Convert note objects to MidiNote instances if needed
    const midiNotes = notes.map(note => {
      return note instanceof MidiNote ? note : new MidiNote(
        note.pitch,
        note.startTime,
        note.duration,
        note.velocity || 80,
        note.channel || 0
      );
    });
    
    session.addNotes(midiNotes);
    
    res.status(201).json({
      success: true,
      message: `${midiNotes.length} notes added to sequence`,
      currentSequenceId: session.currentSequenceId,
      noteCount: session.getCurrentSequence().notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add notes',
      message: error.message
    });
  }
});

// Clear notes from current sequence
app.delete('/api/sessions/:sessionId/notes', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    session.clearNotes();
    
    res.json({
      success: true,
      message: 'All notes cleared from current sequence',
      currentSequenceId: session.currentSequenceId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to clear notes',
      message: error.message
    });
  }
});

// ======================
// MUSIC THEORY ENDPOINTS
// ======================

// Get scale notes
app.get('/api/music-theory/scales', (req, res) => {
  const { rootNote, octave = 4, scaleType = 'major' } = req.query;
  
  // Check if required parameters are present
  if (!rootNote) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Root note is required'
    });
  }
  
  try {
    // Generate scale
    const scaleNotes = MusicTheory.generateScale(
      rootNote,
      parseInt(octave),
      scaleType
    );
    
    // Get note names
    const noteNames = scaleNotes.map(note => MusicTheory.getNoteName(note));
    
    res.json({
      success: true,
      scale: {
        rootNote,
        octave: parseInt(octave),
        scaleType,
        notes: scaleNotes,
        noteNames
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to generate scale',
      message: error.message
    });
  }
});

// Get chord notes
app.get('/api/music-theory/chords', (req, res) => {
  const { rootNote, octave = 4, chordType = 'major' } = req.query;
  
  // Check if required parameters are present
  if (!rootNote) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Root note is required'
    });
  }
  
  try {
    // Generate chord
    const chordNotes = MusicTheory.generateChord(
      rootNote,
      parseInt(octave),
      chordType
    );
    
    // Get note names
    const noteNames = chordNotes.map(note => MusicTheory.getNoteName(note));
    
    res.json({
      success: true,
      chord: {
        rootNote,
        octave: parseInt(octave),
        chordType,
        notes: chordNotes,
        noteNames
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to generate chord',
      message: error.message
    });
  }
});

// Get chord progression
app.get('/api/music-theory/progressions', (req, res) => {
  const { key, octave = 4, progressionName = '1-4-5', scaleType = 'major' } = req.query;
  
  // Check if required parameters are present
  if (!key) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Key is required'
    });
  }
  
  try {
    // Generate progression
    const progression = MusicTheory.generateProgression(
      key,
      parseInt(octave),
      progressionName,
      scaleType
    );
    
    // Format progression for response
    const formattedProgression = progression.map(chord => ({
      root: chord.root,
      octave: chord.octave,
      chordType: chord.chordType,
      notes: chord.notes,
      noteNames: chord.notes.map(note => MusicTheory.getNoteName(note))
    }));
    
    res.json({
      success: true,
      progression: {
        key,
        octave: parseInt(octave),
        progressionName,
        scaleType,
        chords: formattedProgression
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to generate progression',
      message: error.message
    });
  }
});

// ============================
// PATTERN GENERATION ENDPOINTS
// ============================

// Create chord progression pattern
app.post('/api/sessions/:sessionId/patterns/chord-progression', (req, res) => {
  const { sessionId } = req.params;
  const { key, octave = 4, progressionName = '1-4-5', scaleType = 'major', rhythmPattern = [4] } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if required parameters are present
  if (!key) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Key is required'
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: `${key} ${progressionName} Progression`,
        key: `${key} ${scaleType}`
      });
    }
    
    // Generate progression
    const progression = MusicTheory.generateProgression(
      key,
      parseInt(octave),
      progressionName,
      scaleType
    );
    
    // Create chord progression notes
    const notes = PatternGenerators.createChordProgression(
      progression,
      rhythmPattern
    );
    
    // Add notes to sequence
    session.addNotes(notes);
    
    // Format progression for response
    const formattedProgression = progression.map(chord => ({
      root: chord.root,
      octave: chord.octave,
      chordType: chord.chordType,
      noteNames: chord.notes.map(note => MusicTheory.getNoteName(note))
    }));
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${key} ${progressionName} progression`,
      progression: formattedProgression,
      currentSequenceId: session.currentSequenceId,
      noteCount: session.getCurrentSequence().notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create chord progression',
      message: error.message
    });
  }
});

// Create bassline pattern
app.post('/api/sessions/:sessionId/patterns/bassline', (req, res) => {
  const { sessionId } = req.params;
  const { 
    key, 
    octave = 3, 
    progressionName = '1-4-5', 
    scaleType = 'major',
    rhythmPattern = [1, 0.5, 0.5, 1, 1]  // Default rhythm pattern
  } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if required parameters are present
  if (!key) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Key is required'
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: `${key} ${progressionName} Bassline`,
        key: `${key} ${scaleType}`
      });
    }
    
    // Generate progression
    const progression = MusicTheory.generateProgression(
      key,
      parseInt(octave),
      progressionName,
      scaleType
    );
    
    // Create bassline notes
    const notes = PatternGenerators.createBassline(
      progression,
      rhythmPattern
    );
    
    // Add notes to sequence
    session.addNotes(notes);
    
    // Format bassline for response
    const formattedBassline = progression.map(chord => ({
      root: chord.root,
      octave: chord.octave - 1,  // Bassline is an octave lower
      noteName: MusicTheory.getNoteName(chord.notes[0] - 12)
    }));
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${key} ${progressionName} bassline`,
      bassline: formattedBassline,
      currentSequenceId: session.currentSequenceId,
      noteCount: session.getCurrentSequence().notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create bassline',
      message: error.message
    });
  }
});

// Create arpeggio pattern
app.post('/api/sessions/:sessionId/patterns/arpeggio', (req, res) => {
  const { sessionId } = req.params;
  const { 
    rootNote,
    octave = 4,
    chordType = 'major',
    arpeggioPattern = 'up',
    octaveRange = 1,
    noteDuration = 0.25,
    repeats = 4
  } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if required parameters are present
  if (!rootNote) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Root note is required'
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: `${rootNote} ${chordType} Arpeggio`,
        key: rootNote
      });
    }
    
    // Generate chord
    const chordNotes = MusicTheory.generateChord(
      rootNote,
      parseInt(octave),
      chordType
    );
    
    // Create arpeggio notes
    const notes = PatternGenerators.createArpeggio(
      chordNotes,
      octaveRange,
      arpeggioPattern,
      noteDuration,
      0,  // Start time
      repeats
    );
    
    // Add notes to sequence
    session.addNotes(notes);
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from ${rootNote} ${chordType} arpeggio`,
      arpeggio: {
        rootNote,
        octave: parseInt(octave),
        chordType,
        pattern: arpeggioPattern,
        noteNames: chordNotes.map(note => MusicTheory.getNoteName(note))
      },
      currentSequenceId: session.currentSequenceId,
      noteCount: session.getCurrentSequence().notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create arpeggio',
      message: error.message
    });
  }
});

// Create drum pattern
app.post('/api/sessions/:sessionId/patterns/drums', (req, res) => {
  const { sessionId } = req.params;
  const { patternType = 'basic', measures = 2 } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Drum Pattern`,
        key: 'C major'  // Key doesn't matter for drums
      });
    }
    
    // Create drum pattern notes
    const notes = PatternGenerators.createDrumPattern(
      patternType,
      measures
    );
    
    // Add notes to sequence
    session.addNotes(notes);
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes for ${patternType} drum pattern`,
      pattern: {
        type: patternType,
        measures: measures
      },
      currentSequenceId: session.currentSequenceId,
      noteCount: session.getCurrentSequence().notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create drum pattern',
      message: error.message
    });
  }
});

// Create custom rhythmic pattern
app.post('/api/sessions/:sessionId/patterns/rhythmic', (req, res) => {
  const { sessionId } = req.params;
  const { 
    noteValues,  // Array of note durations (e.g., [1, 0.5, 0.5, 1])
    notePitches,  // Array of note pitches (e.g., [60, 64, 67])
    startTime = 0,
    repeats = 1
  } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if required parameters are present
  if (!noteValues || !notePitches) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'Note values and pitches are required'
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Create sequence if none exists
    if (!session.getCurrentSequence()) {
      session.createSequence({
        name: 'Custom Rhythmic Pattern',
        key: 'C major'
      });
    }
    
    // Create rhythmic pattern notes
    const notes = PatternGenerators.createRhythmicPattern(
      noteValues,
      notePitches,
      startTime,
      repeats
    );
    
    // Add notes to sequence
    session.addNotes(notes);
    
    res.json({
      success: true,
      message: `Added ${notes.length} notes from custom rhythmic pattern`,
      pattern: {
        noteValues,
        notePitches: Array.isArray(notePitches[0]) 
          ? 'Multiple pitch arrays provided' 
          : notePitches.map(pitch => MusicTheory.getNoteName(pitch)),
        repeats
      },
      currentSequenceId: session.currentSequenceId,
      noteCount: session.getCurrentSequence().notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create rhythmic pattern',
      message: error.message
    });
  }
});

// =======================
// VARIATION AND OPERATIONS
// =======================

// Create variation of current sequence
app.post('/api/sessions/:sessionId/operations/variation', (req, res) => {
  const { sessionId } = req.params;
  const { 
    transpose = 0,
    velocityChange = 0,
    timingVariation = 0,
    noteAdditionRate = 0,
    noteRemovalRate = 0,
    name
  } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Check if current sequence exists
  const currentSequence = session.getCurrentSequence();
  if (!currentSequence) {
    return res.status(400).json({
      success: false,
      error: 'No current sequence',
      message: 'No current sequence selected'
    });
  }
  
  try {
    // Create variation
    const variation = SequenceOperations.createVariation(
      currentSequence,
      {
        transpose,
        velocityChange,
        timingVariation,
        noteAdditionRate,
        noteRemovalRate
      }
    );
    
    // Set variation name
    variation.name = name || `${currentSequence.name} (Variation)`;
    
    // Add variation as new sequence
    session.sequences[variation.id] = variation;
    session.currentSequenceId = variation.id;
    
    res.json({
      success: true,
      message: 'Variation created successfully',
      variation: {
        id: variation.id,
        name: variation.name,
        noteCount: variation.notes.length,
        originalSequenceId: currentSequence.id
      },
      currentSequenceId: session.currentSequenceId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create variation',
      message: error.message
    });
  }
});

// Quantize current sequence
app.post('/api/sessions/:sessionId/operations/quantize', (req, res) => {
  const { sessionId } = req.params;
  const { gridSize = 0.25 } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Check if current sequence exists
  const currentSequence = session.getCurrentSequence();
  if (!currentSequence) {
    return res.status(400).json({
      success: false,
      error: 'No current sequence',
      message: 'No current sequence selected'
    });
  }
  
  try {
    // Create quantized sequence
    const quantized = SequenceOperations.quantizeSequence(
      currentSequence,
      gridSize
    );
    
    // Replace current sequence with quantized version
    session.sequences[currentSequence.id] = quantized;
    
    res.json({
      success: true,
      message: 'Sequence quantized successfully',
      gridSize,
      sequenceId: currentSequence.id,
      noteCount: quantized.notes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to quantize sequence',
      message: error.message
    });
  }
});

// Change rhythm of current sequence
app.post('/api/sessions/:sessionId/operations/change-rhythm', (req, res) => {
  const { sessionId } = req.params;
  const { rhythmPattern } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if rhythm pattern is provided
  if (!rhythmPattern || !Array.isArray(rhythmPattern)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid rhythm pattern',
      message: 'Rhythm pattern must be provided as an array'
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Check if current sequence exists
  const currentSequence = session.getCurrentSequence();
  if (!currentSequence) {
    return res.status(400).json({
      success: false,
      error: 'No current sequence',
      message: 'No current sequence selected'
    });
  }
  
  try {
    // Create sequence with new rhythm
    const newSequence = SequenceOperations.changeRhythm(
      currentSequence,
      rhythmPattern
    );
    
    // Add as new sequence
    session.sequences[newSequence.id] = newSequence;
    session.currentSequenceId = newSequence.id;
    
    res.json({
      success: true,
      message: 'Rhythm changed successfully',
      newSequence: {
        id: newSequence.id,
        name: newSequence.name,
        noteCount: newSequence.notes.length
      },
      currentSequenceId: session.currentSequenceId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to change rhythm',
      message: error.message
    });
  }
});

// Merge multiple sequences
app.post('/api/sessions/:sessionId/operations/merge', (req, res) => {
  const { sessionId } = req.params;
  const { sequenceIds, name } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if sequence IDs are provided
  if (!sequenceIds || !Array.isArray(sequenceIds) || sequenceIds.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sequence IDs',
      message: 'At least two sequence IDs must be provided'
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Get all sequences
    const sequences = sequenceIds.map(id => {
      const seq = session.getSequence(id);
      if (!seq) {
        throw new Error(`Sequence ${id} not found`);
      }
      return seq;
    });
    
    // Merge sequences
    const merged = SequenceOperations.mergeSequences(sequences);
    
    // Set merged sequence name
    merged.name = name || 'Merged Sequence';
    
    // Add merged sequence
    session.sequences[merged.id] = merged;
    session.currentSequenceId = merged.id;
    
    res.json({
      success: true,
      message: 'Sequences merged successfully',
      merged: {
        id: merged.id,
        name: merged.name,
        noteCount: merged.notes.length,
        mergedFrom: sequenceIds
      },
      currentSequenceId: session.currentSequenceId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to merge sequences',
      message: error.message
    });
  }
});

// =================
// EXPORT/IMPORT
// =================

// Export sequence as MIDI
app.get('/api/sessions/:sessionId/sequences/:sequenceId/export', (req, res) => {
  const { sessionId, sequenceId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Get sequence
    const sequence = session.getSequence(sequenceId);
    
    // Export to MIDI data
    const midiData = MidiExporter.sequenceToMidiData(sequence);
    
    res.json({
      success: true,
      message: 'Sequence exported successfully',
      sequence: {
        id: sequence.id,
        name: sequence.name
      },
      format: 'midi',
      data: midiData
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Failed to export sequence',
      message: error.message
    });
  }
});

// Import MIDI data
app.post('/api/sessions/:sessionId/import', (req, res) => {
  const { sessionId } = req.params;
  const { midiData, name } = req.body;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  // Check if MIDI data is provided
  if (!midiData) {
    return res.status(400).json({
      success: false,
      error: 'Missing MIDI data',
      message: 'MIDI data is required'
    });
  }
  
  const session = sessions.get(sessionId);
  
  try {
    // Import MIDI data
    const sequence = MidiExporter.midiDataToSequence(midiData);
    
    // Set sequence name if provided
    if (name) {
      sequence.name = name;
    }
    
    // Add sequence to session
    session.sequences[sequence.id] = sequence;
    session.currentSequenceId = sequence.id;
    
    res.json({
      success: true,
      message: 'MIDI data imported successfully',
      sequence: {
        id: sequence.id,
        name: sequence.name,
        noteCount: sequence.notes.length
      },
      currentSequenceId: session.currentSequenceId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to import MIDI data',
      message: error.message
    });
  }
});

// ==============
// UNDO/REDO
// ==============

// Undo last operation
app.post('/api/sessions/:sessionId/undo', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Try to undo
  const undoResult = session.undo();
  
  if (undoResult) {
    res.json({
      success: true,
      message: 'Operation undone successfully',
      currentSequenceId: session.currentSequenceId,
      historyIndex: session.historyIndex
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Nothing to undo',
      message: 'No operations to undo'
    });
  }
});

// Redo last undone operation
app.post('/api/sessions/:sessionId/redo', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: `No session with ID ${sessionId} exists`
    });
  }
  
  const session = sessions.get(sessionId);
  
  // Try to redo
  const redoResult = session.redo();
  
  if (redoResult) {
    res.json({
      success: true,
      message: 'Operation redone successfully',
      currentSequenceId: session.currentSequenceId,
      historyIndex: session.historyIndex
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Nothing to redo',
      message: 'No operations to redo'
    });
  }
});

// =================
// CAPABILITY INFO
// =================

// Get available music theory capabilities
app.get('/api/capabilities/music-theory', (req, res) => {
  res.json({
    success: true,
    scales: Object.keys(MusicTheory.SCALES),
    chords: Object.keys(MusicTheory.CHORDS),
    progressions: Object.keys(MusicTheory.PROGRESSIONS),
    noteNames: MusicTheory.NOTE_NAMES
  });
});

// Get available pattern generation capabilities
app.get('/api/capabilities/patterns', (req, res) => {
  res.json({
    success: true,
    patterns: [
      {
        type: 'chord-progression',
        description: 'Generate notes for a chord progression',
        parameters: ['key', 'octave', 'progressionName', 'scaleType', 'rhythmPattern']
      },
      {
        type: 'bassline',
        description: 'Generate a bassline from a chord progression',
        parameters: ['key', 'octave', 'progressionName', 'scaleType', 'rhythmPattern']
      },
      {
        type: 'arpeggio',
        description: 'Generate an arpeggio pattern from a chord',
        parameters: ['rootNote', 'octave', 'chordType', 'arpeggioPattern', 'octaveRange', 'noteDuration', 'repeats'],
        arpeggioPatterns: ['up', 'down', 'updown', 'random']
      },
      {
        type: 'drums',
        description: 'Generate a drum pattern',
        parameters: ['patternType', 'measures'],
        patternTypes: ['basic', 'rock', 'funk']
      },
      {
        type: 'rhythmic',
        description: 'Generate a custom rhythmic pattern',
        parameters: ['noteValues', 'notePitches', 'startTime', 'repeats']
      }
    ]
  });
});

// Get available sequence operations
app.get('/api/capabilities/operations', (req, res) => {
  res.json({
    success: true,
    operations: [
      {
        type: 'variation',
        description: 'Create a variation of a sequence',
        parameters: ['transpose', 'velocityChange', 'timingVariation', 'noteAdditionRate', 'noteRemovalRate', 'name']
      },
      {
        type: 'quantize',
        description: 'Quantize note timing to a grid',
        parameters: ['gridSize']
      },
      {
        type: 'change-rhythm',
        description: 'Change the rhythm while preserving pitches',
        parameters: ['rhythmPattern']
      },
      {
        type: 'merge',
        description: 'Merge multiple sequences',
        parameters: ['sequenceIds', 'name']
      }
    ]
  });
});

// Get full API capabilities
app.get('/api/capabilities', (req, res) => {
  res.json({
    success: true,
    name: 'MIDI Song Creation Tool',
    version: '1.0.0',
    description: 'An API for creating and manipulating MIDI sequences',
    endpoints: {
      sessions: '/api/sessions',
      sequences: '/api/sessions/:sessionId/sequences',
      notes: '/api/sessions/:sessionId/notes',
      musicTheory: '/api/music-theory',
      patterns: '/api/sessions/:sessionId/patterns',
      operations: '/api/sessions/:sessionId/operations',
      capabilities: '/api/capabilities'
    },
    more_info: {
      music_theory: '/api/capabilities/music-theory',
      patterns: '/api/capabilities/patterns',
      operations: '/api/capabilities/operations'
    }
  });
});

// Redirect root to index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MIDI Song Creation Tool API running on port ${PORT}`);
  console.log(`Web interface available at http://localhost:${PORT}`);
});

module.exports = app;