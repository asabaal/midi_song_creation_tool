// src/server/models/session.js
const { v4: uuidv4 } = require('uuid');
const { MidiSequence, MidiNote } = require('./sequence');

// In-memory Session implementation similar to the original code
class Session {
  constructor(options = {}) {
    const id = options.id || options._id || `session_${Date.now()}`;
    this._id = id;
    this.id = id; // For backward compatibility
    this.name = options.name || 'Untitled Session';
    this.bpm = options.bpm || 120;
    this.timeSignature = options.timeSignature || [4, 4];
    this.tracks = options.tracks || [];
    this.createdAt = options.createdAt || new Date();
    this.sequences = {}; // Store sequences as in the original code
    this.currentSequenceId = null;
  }

  // Create a new sequence
  createSequence(options = {}) {
    const sequence = new MidiSequence(options);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    
    // Create a corresponding track for the sequence
    this._syncTrackWithSequence(sequence);
    
    return sequence;
  }

  // Get a sequence by ID
  getSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    return this.sequences[sequenceId];
  }

  // Get current sequence
  getCurrentSequence() {
    if (!this.currentSequenceId || !this.sequences[this.currentSequenceId]) {
      return null;
    }
    return this.sequences[this.currentSequenceId];
  }

  // Set current sequence
  setCurrentSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    this.currentSequenceId = sequenceId;
    return this.sequences[sequenceId];
  }

  // List all sequences
  listSequences() {
    return Object.values(this.sequences).map(seq => ({
      id: seq.id,
      name: seq.name,
      key: seq.key,
      tempo: seq.tempo,
      noteCount: seq.notes ? seq.notes.length : 0,
      duration: seq.getDuration ? seq.getDuration() : 0
    }));
  }

  // Add notes to current sequence
  addNotes(notes) {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    // Convert notes to MidiNote objects if needed
    const midiNotes = Array.isArray(notes) ? notes.map(note => {
      if (note instanceof MidiNote) return note;
      
      // Handle plain objects
      return new MidiNote(
        note.pitch,
        note.startTime,
        note.duration,
        note.velocity || 80,
        note.channel || 0
      );
    }) : [];
    
    if (!sequence.notes) {
      sequence.notes = [];
    }
    
    sequence.notes = sequence.notes.concat(midiNotes);
    
    // Sync notes to the corresponding track
    this._syncTrackWithSequence(sequence);
    
    return midiNotes;
  }

  // Clear all notes from current sequence
  clearNotes() {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    const previousNotes = sequence.notes ? [...sequence.notes] : [];
    sequence.notes = [];
    
    // Clear notes from the corresponding track
    this._syncTrackWithSequence(sequence);
    
    return previousNotes;
  }

  // Export current sequence
  exportCurrentSequence() {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    return sequence.toJSON ? sequence.toJSON() : sequence;
  }

  // Import sequence from JSON
  importSequence(json) {
    try {
      // Handle both direct MidiSequence or just data
      const sequence = json instanceof MidiSequence ? 
                      json : 
                      MidiSequence.fromJSON(json);
      this.sequences[sequence.id] = sequence;
      this.currentSequenceId = sequence.id;
      
      // Sync track with the imported sequence
      this._syncTrackWithSequence(sequence);
      
      return sequence;
    } catch (error) {
      console.error('Failed to import sequence:', error.message);
      throw new Error(`Failed to import sequence: ${error.message}`);
    }
  }

  // Private helper function to sync tracks with sequences
  _syncTrackWithSequence(sequence) {
    if (!sequence) return;
    
    // Initialize tracks array if it doesn't exist
    if (!this.tracks) {
      this.tracks = [];
    }
    
    // Find or create a track for this sequence
    let track = this.tracks.find(t => t.id === sequence.id);
    
    // Determine the appropriate instrument based on the first note channel
    let instrument = 0; // Default to piano
    if (sequence.notes && sequence.notes.length > 0) {
      const firstNote = sequence.notes[0];
      if (firstNote.channel === 9 || (firstNote.channel === 10 && firstNote.pitch >= 35 && firstNote.pitch <= 81)) {
        instrument = 9; // Drums
      } else if (firstNote.channel === 1 || firstNote.channel === 32) {
        instrument = 32; // Bass
      }
    }
    
    // If no track exists for this sequence, create one
    if (!track) {
      track = {
        id: sequence.id,
        name: sequence.name || 'Unnamed Track',
        instrument,
        notes: []
      };
      this.tracks.push(track);
    }
    
    // Update the track with the sequence's notes
    track.notes = sequence.notes || [];
    track.name = sequence.name;
    track.instrument = instrument;
    
    return track;
  }

  // Mock save method to make API compatible
  async save() {
    // Update the session in the in-memory store
    sessions.set(this.id, this);
    return this;
  }

  // Static methods for finding/querying
  static async findById(id) {
    if (!id) return null; // Don't throw an error, just return null if ID is missing
    return sessions.get(id) || null;
  }

  static async find(query = {}) {
    return Array.from(sessions.values());
  }

  static async findByIdAndDelete(id) {
    const session = sessions.get(id);
    if (session) {
      sessions.delete(id);
    }
    return session;
  }
}

// In-memory store for sessions
const sessions = new Map();

module.exports = { Session, sessions };
