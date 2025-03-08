// src/core/midiSequence.js
class MidiSequence {
  constructor() {
    this.tracks = [];
    this.tempo = 120;
    this.bpm = 120; // Alias for tests
    this.timeSignature = [4, 4]; // Add for tests
  }
  
  addTrack(instrument = 0, name = '') {
    const trackId = this.tracks.length;
    this.tracks.push({
      notes: [],
      instrument,
      name,
      id: trackId
    });
    return trackId;
  }
  
  setTempo(tempo) {
    this.tempo = tempo;
    this.bpm = tempo; // Update alias for tests
  }
  
  addNote(trackId, note) {
    // Create track if it doesn't exist
    while (this.tracks.length <= trackId) {
      this.addTrack();
    }
    
    this.tracks[trackId].notes.push({
      pitch: note.pitch,
      startTime: note.startTime,
      duration: note.duration,
      velocity: note.velocity || 100
    });
    
    return this.tracks[trackId].notes.length - 1;
  }
  
  removeNote(trackId, noteIndex) {
    if (trackId < this.tracks.length && noteIndex < this.tracks[trackId].notes.length) {
      this.tracks[trackId].notes.splice(noteIndex, 1);
      return true;
    }
    return false;
  }
  
  getDuration() {
    let maxDuration = 0;
    
    this.tracks.forEach(track => {
      track.notes.forEach(note => {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > maxDuration) {
          maxDuration = noteEnd;
        }
      });
    });
    
    return maxDuration;
  }
  
  quantizeNotes(gridSize) {
    this.tracks.forEach(track => {
      track.notes.forEach(note => {
        // Quantize start time to nearest grid value
        note.startTime = Math.round(note.startTime / gridSize) * gridSize;
        
        // Quantize duration to nearest grid value
        note.duration = Math.round(note.duration / gridSize) * gridSize;
        
        // Ensure minimum duration
        if (note.duration < gridSize) {
          note.duration = gridSize;
        }
      });
    });
  }
  
  transposeTrack(trackId, semitones) {
    if (trackId < this.tracks.length) {
      this.tracks[trackId].notes.forEach(note => {
        note.pitch += semitones;
      });
      return true;
    }
    return false;
  }
  
  wouldCollide(noteCandidate) {
    const { trackId, pitch, startTime, duration } = noteCandidate;
    
    if (trackId >= this.tracks.length) {
      return false;
    }
    
    const endTime = startTime + duration;
    
    return this.tracks[trackId].notes.some(note => {
      if (note.pitch !== pitch) {
        return false;
      }
      
      const noteEndTime = note.startTime + note.duration;
      
      // Check for overlap
      return (startTime < noteEndTime && endTime > note.startTime);
    });
  }
}

module.exports = { MidiSequence };
