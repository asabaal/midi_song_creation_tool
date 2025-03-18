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
    this.sequences = options.sequences || {}; // Store sequences as in the original code
    this.currentSequenceId = options.currentSequenceId || null;
    
    // If options already has sequences and tracks, make sure they're synced
    if (options.sequences && Object.keys(options.sequences).length > 0) {
      const sequenceIds = Object.keys(options.sequences);
      sequenceIds.forEach(seqId => {
        this._syncTrackWithSequence(options.sequences[seqId]);
      });
    }
  }

  // Create a new sequence
  createSequence(options = {}) {
    const sequence = new MidiSequence(options);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    
    // CRITICAL FIX: Also create a corresponding track
    this._syncTrackWithSequence(sequence);
    
    return sequence;
  }

  // Helper method to sync a sequence with its corresponding track
  _syncTrackWithSequence(sequence) {
    // Find or create a track for this sequence
    let track = this.tracks.find(t => t.id === sequence.id);
    
    if (!track) {
      // Create a new track if one doesn't exist
      track = {
        id: sequence.id,
        name: sequence.name || 'New Track',
        instrument: 0, // Default instrument
        notes: sequence.notes || []
      };
      this.tracks.push(track);
      console.log(`Created new track with id ${track.id} for sequence ${sequence.id}`);
    } else {
      // Update existing track with sequence notes
      track.notes = sequence.notes || [];
      console.log(`Updated track ${track.id} with ${track.notes.length} notes from sequence ${sequence.id}`);
    }
    
    return track;
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
    
    // CRITICAL FIX: Also update the corresponding track
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
    
    // CRITICAL FIX: Also clear notes from the corresponding track
    const track = this.tracks.find(t => t.id === sequence.id);
    if (track) {
      track.notes = [];
    }
    
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
      
      // CRITICAL FIX: Also create/update the corresponding track
      this._syncTrackWithSequence(sequence);
      
      return sequence;
    } catch (error) {
      console.error('Failed to import sequence:', error.message);
      throw new Error(`Failed to import sequence: ${error.message}`);
    }
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
    
    // Get the session from the map
    const sessionData = sessions.get(id);
    if (!sessionData) return null;
    
    // CRITICAL FIX: Ensure we return a Session instance with all prototype methods
    // If it's already a Session instance, return it directly
    if (sessionData instanceof Session) {
      return sessionData;
    }
    
    // Otherwise, wrap it in a new Session instance to ensure all methods are available
    return new Session(sessionData);
  }

  static async find(query = {}) {
    // Convert all Map values to proper Session instances
    return Array.from(sessions.values()).map(sessionData => {
      if (sessionData instanceof Session) {
        return sessionData;
      }
      return new Session(sessionData);
    });
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
