// src/core/midiSequence.js
class MidiSequence {
  constructor() {
    this.tracks = [];
    this.tempo = 120;
  }
  
  addTrack(track) {
    this.tracks.push(track);
  }
  
  setTempo(tempo) {
    this.tempo = tempo;
  }
}

module.exports = { MidiSequence };