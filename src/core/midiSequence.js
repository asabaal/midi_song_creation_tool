// src/core/midiSequence.js
/**
 * MidiSequence class - represents a MIDI sequence with multiple tracks
 * Each track contains notes with timing information
 */

class MidiSequence {
  /**
   * Create a new MIDI sequence
   * @param {Object} options - Configuration options
   * @param {number} options.tempo - Tempo in BPM (defaults to 120)
   * @param {Object} options.timeSignature - Time signature (numerator/denominator)
   * @param {number} options.ticksPerBeat - MIDI ticks per beat (defaults to 480)
   */
  constructor(options = {}) {
    this.tempo = options.tempo || 120;
    this.timeSignature = options.timeSignature || { numerator: 4, denominator: 4 };
    this.ticksPerBeat = options.ticksPerBeat || 480;
    this.tracks = [];
    this.totalDuration = 0;

    // Create a default track if not provided
    this.addTrack({ name: 'Track 1', instrument: 0 });
  }

  /**
   * Add a new track to the sequence
   * @param {Object} trackData - Track data (name, instrument, etc.)
   * @returns {number} Index of the new track
   */
  addTrack(trackData = {}) {
    const track = {
      name: trackData.name || `Track ${this.tracks.length + 1}`,
      instrument: trackData.instrument !== undefined ? trackData.instrument : 0, // Default to piano
      notes: [],
      ...trackData,
    };

    // Initialize notes array if not provided
    if (!track.notes) {
      track.notes = [];
    }

    // Add the track and return its index
    this.tracks.push(track);
    return this.tracks.length - 1;
  }

  /**
   * Add a note to a specific track
   * @param {number} trackIndex - Index of the track
   * @param {Object} noteData - Note data (pitch, startTime, duration, velocity)
   * @returns {Object} The added note
   */
  addNote(trackIndex, noteData) {
    // Validate that the track exists
    if (trackIndex < 0 || trackIndex >= this.tracks.length) {
      throw new Error(`Track index ${trackIndex} is out of bounds`);
    }

    // Create a new note with defaults
    const note = {
      pitch: noteData.pitch || 60, // Default to middle C
      startTime: noteData.startTime || 0, // Start at the beginning
      duration: noteData.duration || 1, // Default to a quarter note
      velocity: noteData.velocity !== undefined ? noteData.velocity : 100, // Default velocity
      ...noteData,
    };

    // Add note to track
    this.tracks[trackIndex].notes.push(note);

    // Update sequence duration if needed
    const noteEnd = note.startTime + note.duration;
    if (noteEnd > this.totalDuration) {
      this.totalDuration = noteEnd;
    }

    return note;
  }

  /**
   * Remove a note from a track
   * @param {number} trackIndex - Index of the track
   * @param {number} noteIndex - Index of the note to remove
   * @returns {boolean} True if note was removed successfully
   */
  removeNote(trackIndex, noteIndex) {
    // Validate track and note indices
    if (
      trackIndex < 0 ||
      trackIndex >= this.tracks.length ||
      noteIndex < 0 ||
      noteIndex >= this.tracks[trackIndex].notes.length
    ) {
      return false;
    }

    // Remove the note
    this.tracks[trackIndex].notes.splice(noteIndex, 1);

    // Recalculate total duration
    this._recalculateDuration();

    return true;
  }

  /**
   * Get the duration of the sequence in beats
   * @returns {number} Duration in beats
   */
  getDuration() {
    return this.totalDuration;
  }

  /**
   * Recalculate the total duration of the sequence
   * @private
   */
  _recalculateDuration() {
    this.totalDuration = 0;
    this.tracks.forEach(track => {
      track.notes.forEach(note => {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > this.totalDuration) {
          this.totalDuration = noteEnd;
        }
      });
    });
  }

  /**
   * Quantize note timings to a grid
   * @param {number} gridSize - Grid size in beats (e.g., 0.25 for sixteenth notes)
   */
  quantizeNotes(gridSize = 0.25) {
    this.tracks.forEach(track => {
      track.notes.forEach(note => {
        // Quantize start time
        note.startTime = Math.round(note.startTime / gridSize) * gridSize;

        // Quantize duration
        note.duration = Math.max(gridSize, Math.round(note.duration / gridSize) * gridSize);
      });
    });

    // Recalculate duration after quantizing
    this._recalculateDuration();
  }

  /**
   * Transpose all notes in the sequence
   * @param {number} semitones - Number of semitones to transpose (positive or negative)
   */
  transpose(semitones) {
    if (semitones === 0) return; // No change needed

    this.tracks.forEach(track => {
      track.notes.forEach(note => {
        note.pitch += semitones;
      });
    });
  }

  /**
   * Check for colliding notes in a track
   * @param {number} trackIndex - Index of the track
   * @returns {Array} Array of colliding note pairs
   */
  findNoteCollisions(trackIndex) {
    if (trackIndex < 0 || trackIndex >= this.tracks.length) {
      return [];
    }

    const collisions = [];
    const notes = this.tracks[trackIndex].notes;

    // Check each pair of notes
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const note1 = notes[i];
        const note2 = notes[j];

        // Check if the notes are the same pitch
        if (note1.pitch !== note2.pitch) continue;

        // Check for time overlap
        const note1Start = note1.startTime;
        const note1End = note1.startTime + note1.duration;
        const note2Start = note2.startTime;
        const note2End = note2.startTime + note2.duration;

        if (note1Start < note2End && note1End > note2Start) {
          collisions.push({ noteIndex1: i, noteIndex2: j });
        }
      }
    }

    return collisions;
  }

  /**
   * Debug information about the sequence
   */
  debug() {
    // eslint-disable-next-line no-console
    console.log(`MidiSequence: ${this.tracks.length} tracks, ${this.totalDuration} beats, ` + 
      `tempo: ${this.tempo}`);
    this.tracks.forEach((track, i) => {
      // eslint-disable-next-line no-console
      console.log(`Track ${i}: ${track.name}, ${track.notes.length} notes`);
    });
  }
}

module.exports = MidiSequence;
