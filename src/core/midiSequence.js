// src/core/midiSequence.js
class MidiSequence {
  constructor() {
    this.tracks = [];
    this.bpm = 120; // Changed from tempo to bpm as tests expect
    this.timeSignature = [4, 4];
    this.notes = [];
  }
  
  addTrack(track) {
    this.tracks.push(track);
    return this.tracks.length - 1; // Return the track index
  }
  
  setTempo(tempo) {
    this.bpm = tempo; // Update bpm instead of tempo
  }

  addNote(note) {
    // Ensure the note has an ID
    note.id = note.id || Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Add track if it doesn't exist
    while (this.tracks.length <= note.trackId) {
      this.addTrack({ name: `Track ${this.tracks.length}` });
    }
    
    this.notes.push(note);
    return note.id;
  }

  removeNote(noteId) {
    const index = this.notes.findIndex(note => note.id === noteId);
    if (index !== -1) {
      this.notes.splice(index, 1);
      return true;
    }
    return false;
  }

  getNotes(trackId = null) {
    if (trackId === null) {
      return this.notes;
    }
    return this.notes.filter(note => note.trackId === trackId);
  }

  calculateDuration() {
    if (this.notes.length === 0) {
      return 0;
    }
    
    return Math.max(...this.notes.map(note => note.startTime + note.duration));
  }

  quantize(gridSize = 0.25) {
    this.notes.forEach(note => {
      note.startTime = Math.round(note.startTime / gridSize) * gridSize;
      note.duration = Math.round(note.duration / gridSize) * gridSize;
      if (note.duration < gridSize) {
        note.duration = gridSize;
      }
    });
  }

  transpose(semitones, trackId = null) {
    const notesToTranspose = trackId === null 
      ? this.notes 
      : this.notes.filter(note => note.trackId === trackId);
    
    notesToTranspose.forEach(note => {
      note.pitch += semitones;
    });
  }

  handleCollisions() {
    // Group notes by track
    const trackNotes = {};
    
    this.notes.forEach(note => {
      if (!trackNotes[note.trackId]) {
        trackNotes[note.trackId] = [];
      }
      trackNotes[note.trackId].push(note);
    });

    // Handle collisions within each track
    Object.values(trackNotes).forEach(notes => {
      // Sort notes by start time
      notes.sort((a, b) => a.startTime - b.startTime);
      
      // Check for overlaps
      for (let i = 0; i < notes.length - 1; i++) {
        const currentNote = notes[i];
        const nextNote = notes[i + 1];
        
        // If current note overlaps with next note
        if (currentNote.startTime + currentNote.duration > nextNote.startTime) {
          // Adjust current note duration
          currentNote.duration = nextNote.startTime - currentNote.startTime;
          
          // Ensure minimum duration
          if (currentNote.duration < 0.1) {
            currentNote.duration = 0.1;
          }
        }
      }
    });
  }
}

module.exports = { MidiSequence };
