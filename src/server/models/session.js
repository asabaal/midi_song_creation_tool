// src/server/models/session.js
const { v4: uuidv4 } = require('uuid');
const { MidiSequence, MidiNote } = require('./sequence');

// In-memory Session implementation
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
      
      console.log(`Created initial sequence ${newSequence.id} and track`);
    }
    
    // Make sure we have proper synchronization between tracks and sequences
    this.syncAllTracksAndSequences();
    
    console.log(`Session ${id} initialized with ${this.tracks.length} tracks and ${Object.keys(this.sequences).length} sequences`);
  }

  // Create a new sequence
  createSequence(options = {}) {
    const sequence = new MidiSequence(options);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    
    // CRITICAL: Also create a corresponding track
    const track = {
      id: sequence.id,
      name: sequence.name || 'New Track',
      instrument: options.instrument || 0,
      notes: Array.isArray(sequence.notes) ? [...sequence.notes] : []
    };
    this.tracks.push(track);
    
    console.log(`Created new sequence ${sequence.id} and corresponding track`);
    return sequence;
  }

  // Get a sequence by ID
  getSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    
    // Ensure track and sequence are synced before returning
    const track = this.tracks.find(t => t.id === sequenceId);
    if (track) {
      // If track exists, make sure its notes are in the sequence
      this.sequences[sequenceId].notes = [...track.notes];
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
        return this.getSequence(this.currentSequenceId);
      }
      
      // If no sequences exist, create one
      const newSequence = this.createSequence({
        name: 'New Sequence',
        tempo: this.bpm,
        key: 'C major'
      });
      
      this.currentSequenceId = newSequence.id;
      return newSequence;
    }
    
    // Always return through getSequence to ensure sync
    return this.getSequence(this.currentSequenceId);
  }

  // Set current sequence
  setCurrentSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    this.currentSequenceId = sequenceId;
    return this.getSequence(sequenceId);
  }

  // List all sequences
  listSequences() {
    // Make sure all sequences and tracks are synced before listing
    this.syncAllTracksAndSequences();
    
    return Object.values(this.sequences).map(seq => ({
      id: seq.id,
      name: seq.name,
      key: seq.key,
      tempo: seq.tempo,
      noteCount: seq.notes ? seq.notes.length : 0,
      duration: seq.getDuration ? seq.getDuration() : 0
    }));
  }

  // Add notes to current sequence - CRITICAL FUNCTION
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
    
    // Add notes to the sequence
    sequence.notes = sequence.notes.concat(midiNotes);
    
    console.log(`Added ${midiNotes.length} notes to sequence ${sequence.id}. Total notes: ${sequence.notes.length}`);
    
    // Also update the corresponding track
    const track = this.tracks.find(t => t.id === sequence.id);
    if (track) {
      if (!track.notes) {
        track.notes = [];
      }
      
      // Important: Convert notes to plain objects for storage in tracks
      const plainNotes = midiNotes.map(note => ({
        pitch: note.pitch,
        startTime: note.startTime, 
        duration: note.duration,
        velocity: note.velocity,
        channel: note.channel
      }));
      
      track.notes = track.notes.concat(plainNotes);
      console.log(`Updated track ${track.id} with ${plainNotes.length} notes. Total notes: ${track.notes.length}`);
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
      let track = this.tracks.find(t => t.id === sequence.id);
      
      if (!track) {
        track = {
          id: sequence.id,
          name: sequence.name || 'Imported Track',
          instrument: 0,
          notes: []
        };
        this.tracks.push(track);
      }
      
      // Copy notes from sequence to track
      track.notes = Array.isArray(sequence.notes) ? 
        sequence.notes.map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          velocity: note.velocity,
          channel: note.channel
        })) : [];
      
      console.log(`Imported sequence ${sequence.id} with ${sequence.notes ? sequence.notes.length : 0} notes`);
      
      return sequence;
    } catch (error) {
      console.error('Failed to import sequence:', error.message);
      throw new Error(`Failed to import sequence: ${error.message}`);
    }
  }

  // Sync all tracks and sequences - CRITICAL FUNCTION
  syncAllTracksAndSequences() {
    console.log(`Syncing all tracks and sequences in session ${this.id}`);
    
    // First, create tracks for sequences that don't have corresponding tracks
    Object.values(this.sequences).forEach(sequence => {
      let track = this.tracks.find(t => t.id === sequence.id);
      
      if (!track) {
        // Create a new track for this sequence
        track = {
          id: sequence.id,
          name: sequence.name || 'New Track',
          instrument: 0,
          notes: []
        };
        this.tracks.push(track);
        console.log(`Created track ${track.id} for sequence ${sequence.id}`);
      }
      
      // Copy notes from sequence to track
      if (sequence.notes && Array.isArray(sequence.notes)) {
        track.notes = sequence.notes.map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          velocity: note.velocity || 80,
          channel: note.channel || 0
        }));
        console.log(`Copied ${sequence.notes.length} notes from sequence ${sequence.id} to track ${track.id}`);
      }
    });
    
    // Then, create sequences for tracks that don't have corresponding sequences
    this.tracks.forEach(track => {
      if (!this.sequences[track.id]) {
        // Create a new sequence for this track
        this.sequences[track.id] = new MidiSequence({
          id: track.id,
          name: track.name || 'New Sequence',
          notes: track.notes || []
        });
        console.log(`Created sequence ${track.id} for track ${track.id}`);
      } else {
        // Copy notes from track to sequence
        if (track.notes && Array.isArray(track.notes)) {
          this.sequences[track.id].notes = track.notes.map(note => 
            new MidiNote(
              note.pitch,
              note.startTime,
              note.duration,
              note.velocity || 80,
              note.channel || 0
            )
          );
          console.log(`Copied ${track.notes.length} notes from track ${track.id} to sequence ${track.id}`);
        }
      }
    });
    
    // Ensure there's always a current sequence
    if (!this.currentSequenceId || !this.sequences[this.currentSequenceId]) {
      const sequenceIds = Object.keys(this.sequences);
      if (sequenceIds.length > 0) {
        this.currentSequenceId = sequenceIds[0];
        console.log(`Set current sequence to ${this.currentSequenceId}`);
      }
    }
    
    console.log(`Sync complete: ${this.tracks.length} tracks and ${Object.keys(this.sequences).length} sequences`);
    return this;
  }

  // Mock save method to make API compatible
  async save() {
    // First sync all tracks and sequences
    this.syncAllTracksAndSequences();
    
    // Update the session in the in-memory store
    sessions.set(this.id, this);
    
    // Log tracks and notes for debugging
    if (this.tracks) {
      this.tracks.forEach(track => {
        console.log(`Track ${track.id} (${track.name}) has ${track.notes ? track.notes.length : 0} notes`);
      });
    }
    
    if (this.sequences) {
      Object.values(this.sequences).forEach(seq => {
        console.log(`Sequence ${seq.id} (${seq.name}) has ${seq.notes ? seq.notes.length : 0} notes`);
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
