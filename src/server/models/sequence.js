// src/server/models/sequence.js
const { v4: uuidv4 } = require('uuid');

// MidiNote implementation
class MidiNote {
  constructor(pitch, startTime, duration, velocity = 80, channel = 0) {
    this.pitch = pitch;
    this.startTime = startTime;
    this.duration = duration;
    this.velocity = velocity;
    this.channel = channel;
  }

  toJSON() {
    return {
      pitch: this.pitch,
      startTime: this.startTime,
      duration: this.duration,
      velocity: this.velocity,
      channel: this.channel
    };
  }
}

// MidiSequence implementation
class MidiSequence {
  constructor(options = {}) {
    this.id = options.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    this.name = options.name || 'Untitled Sequence';
    this.notes = [];
    this.timeSignature = options.timeSignature || { numerator: 4, denominator: 4 };
    this.tempo = options.tempo || 120;
    this.key = options.key || 'C major';
  }

  addNote(note) {
    this.notes.push(note);
    return this;
  }

  addNotes(notes) {
    if (!notes) {
      console.error('Attempted to add undefined notes to sequence');
      return this;
    }
    
    if (!Array.isArray(notes)) {
      console.error('Attempted to add non-array notes to sequence');
      return this;
    }
    
    notes.forEach(note => {
      if (note) this.addNote(note);
    });
    return this;
  }

  clear() {
    this.notes = [];
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      timeSignature: this.timeSignature,
      tempo: this.tempo,
      key: this.key,
      notes: this.notes.map(n => n.toJSON ? n.toJSON() : n)
    };
  }

  // Static method to create a sequence from JSON
  static fromJSON(json) {
    try {
      // Handle both string and object inputs safely
      let data;
      if (typeof json === 'string') {
        data = JSON.parse(json);
      } else if (typeof json === 'object' && json !== null) {
        data = json;
      } else {
        throw new Error('Invalid JSON input - must be a string or object');
      }
      
      // Handle if data is nested inside another object (like API response)
      if (data.data && typeof data.data === 'object') {
        data = data.data;
      }
      
      // Create a new sequence with the imported data
      const sequence = new MidiSequence({
        id: data.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        name: data.name || 'Imported Sequence',
        timeSignature: data.timeSignature || { numerator: 4, denominator: 4 },
        tempo: data.tempo || 120,
        key: data.key || 'C major'
      });
      
      // Add notes if they exist
      if (data.notes && Array.isArray(data.notes)) {
        const midiNotes = data.notes.map(note => 
          new MidiNote(
            note.pitch,
            note.startTime,
            note.duration,
            note.velocity || 80,
            note.channel || 0
          )
        );
        sequence.addNotes(midiNotes);
      } else {
        console.log('No notes found in imported data or notes is not an array');
        // Initialize with empty notes array
        sequence.notes = [];
      }
      
      return sequence;
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      console.error('JSON input was:', json);
      throw new Error(`Failed to parse sequence data: ${error.message}`);
    }
  }
}

module.exports = { MidiNote, MidiSequence };
