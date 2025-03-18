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
    
    // IMPORTANT: Initialize an empty sequence if none exists
    if (Object.keys(this.sequences).length === 0) {
      const newSequence = new MidiSequence({
        name: 'Main Sequence',
        tempo: this.bpm,
        key: 'C major'
      });
      this.sequences[newSequence.id] = newSequence;
      this.currentSequenceId = newSequence.id;
      
      // Also create a corresponding track
      const track = {
        id: newSequence.id,
        name: newSequence.name,
        instrument: 0,
        notes: []
      };
      this.tracks.push(track);
    }
    
    // If options already has sequences, make sure they're synced with tracks
    if (options.sequences && Object.keys(options.sequences).length > 0) {
      Object.values(options.sequences).forEach(sequence => {
        this._syncTrackWithSequence(sequence);
      });
    }
    
    // Make sure every track has a corresponding sequence
    if (this.tracks && this.tracks.length > 0) {
      this.tracks.forEach(track => {
        if (!this.sequences[track.id]) {
          this.sequences[track.id] = new MidiSequence({
            id: track.id,
            name: track.name,
            notes: track.notes || []
          });
        } else {
          // Make sure sequence has the track's notes
          this.sequences[track.id].notes = Array.isArray(track.notes) ? [...track.notes] : [];
        }
      });
    }
    
    console.log(`Session ${id} initialized with ${this.tracks.length} tracks and ${Object.keys(this.sequences).length} sequences`);
  }

  // Create a new sequence
  createSequence(options = {}) {
    const sequence = new MidiSequence(options);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    
    // CRITICAL: Also create a corresponding track
    this._syncTrackWithSequence(sequence);
    
    console.log(`Created new sequence ${sequence.id} and synced with tracks`);
    return sequence;
  }

  // Helper method to sync a sequence with its corresponding track
  _syncTrackWithSequence(sequence) {
    // Ensure sequence has an ID
    if (!sequence.id) {
      sequence.id = `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    }
    
    // Find or create a track for this sequence
    let track = this.tracks.find(t => t.id === sequence.id);
    
    if (!track) {
      // Create a new track if one doesn't exist
      track = {
        id: sequence.id,
        name: sequence.name || 'New Track',
        instrument: 0, // Default instrument
        notes: Array.isArray(sequence.notes) ? JSON.parse(JSON.stringify(sequence.notes)) : []
      };
      this.tracks.push(track);
      console.log(`Created new track with id ${track.id} for sequence ${sequence.id}`);
    } else {
      // Update existing track with sequence notes
      track.notes = Array.isArray(sequence.notes) ? JSON.parse(JSON.stringify(sequence.notes)) : [];
      console.log(`Updated track ${track.id} with ${track.notes ? track.notes.length : 0} notes from sequence ${sequence.id}`);
    }
    
    // Ensure track has a name from sequence if not set
    if (!track.name && sequence.name) {
      track.name = sequence.name;
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
      // Find the first available sequence
      const sequenceIds = Object.keys(this.sequences);
      if (sequenceIds.length > 0) {
        this.currentSequenceId = sequenceIds[0];
        return this.sequences[this.currentSequenceId];
      }
      
      // If no sequences exist, create one
      const newSequence = new MidiSequence({
        name: 'New Sequence',
        tempo: this.bpm,
        key: 'C major'
      });
      this.sequences[newSequence.id] = newSequence;
      this.currentSequenceId = newSequence.id;
      
      // Create corresponding track
      this._syncTrackWithSequence(newSequence);
      
      return newSequence;
    }
    return this.sequences[this.currentSequenceId];
  }

  // Set current sequence
  setCurrentSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    this.currentSequenceId = sequenceId;
    
    // Make sure the track is synced
    this._syncTrackWithSequence(this.sequences[sequenceId]);
    
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
    
    // CRITICAL: Also update the corresponding track
    this._syncTrackWithSequence(sequence);
    
    console.log(`Added ${midiNotes.length} notes to sequence ${sequence.id}`);
    
    // Verify the notes were added to both the sequence and track
    const track = this.tracks.find(t => t.id === sequence.id);
    if (track) {
      console.log(`Track ${track.id} now has ${track.notes.length} notes`);
    } else {
      console.error(`Warning: No track found for sequence ${sequence.id}`);
    }
    
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
    
    // CRITICAL: Also clear notes from the corresponding track
    const track = this.tracks.find(t => t.id === sequence.id);
    if (track) {
      track.notes = [];
      console.log(`Cleared notes from track ${track.id}`);
    } else {
      console.error(`Warning: No track found for sequence ${sequence.id}`);
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
      
      // CRITICAL: Also create/update the corresponding track
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
    
    // Log tracks and notes for debugging
    if (this.tracks) {
      this.tracks.forEach(track => {
        console.log(`Track ${track.id} (${track.name}) has ${track.notes ? track.notes.length : 0} notes`);
      });
    }
    
    return this;
  }

  // Static methods for finding/querying
  static async findById(id) {
    if (!id) return null; // Don't throw an error, just return null if ID is missing
    
    // Get the session from the map
    const sessionData = sessions.get(id);
    if (!sessionData) return null;
    
    // CRITICAL: Ensure we return a Session instance with all prototype methods
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
