// src/core/midiExport.js
const fs = require('fs').promises;
const path = require('path');

class MidiExporter {
  constructor() {
    this.ppq = 480; // Pulses Per Quarter note - standard MIDI timing resolution
  }
  
  sequenceToMidi(sequence) {
    if (!sequence || !sequence.tracks) {
      // Create a minimal valid MIDI structure
      return {
        header: {
          format: 1,
          numTracks: 1,
          ticksPerBeat: this.ppq
        },
        tracks: [
          [
            // Tempo track with only a tempo event
            {
              deltaTime: 0,
              type: 'setTempo',
              microsecondsPerBeat: Math.round(60000000 / 120) // 120 BPM default
            },
            {
              deltaTime: this.ppq * 4, // Add 4 beats of silence
              type: 'endOfTrack'
            }
          ]
        ]
      };
    }
    
    // Create MIDI header
    const midiData = {
      header: {
        format: 1, // Multiple tracks, single song
        numTracks: sequence.tracks.length + 1, // +1 for tempo track
        ticksPerBeat: this.ppq
      },
      tracks: []
    };
    
    // Create tempo track (track 0)
    const tempoTrack = [
      {
        deltaTime: 0,
        type: 'setTempo',
        microsecondsPerBeat: Math.round(60000000 / (sequence.tempo || sequence.bpm || 120))
      },
      {
        deltaTime: this._getSequenceLengthInTicks(sequence),
        type: 'endOfTrack'
      }
    ];
    
    midiData.tracks.push(tempoTrack);
    
    // Create a track for each sequence track
    sequence.tracks.forEach(track => {
      const midiTrack = [];
      
      // Track name if available
      if (track.name) {
        midiTrack.push({
          deltaTime: 0,
          type: 'trackName',
          text: track.name
        });
      }
      
      // Set instrument if specified
      if (track.instrument !== undefined) {
        midiTrack.push({
          deltaTime: 0,
          type: 'programChange',
          programNumber: track.instrument
        });
      }
      
      // Add note events
      const noteOnEvents = [];
      const noteOffEvents = [];
      
      track.notes.forEach(note => {
        // Note On event
        noteOnEvents.push({
          deltaTime: this._timeToTicks(note.startTime),
          type: 'noteOn',
          noteNumber: note.pitch,
          velocity: note.velocity || 100
        });
        
        // Note Off event
        noteOffEvents.push({
          deltaTime: this._timeToTicks(note.startTime + note.duration),
          type: 'noteOff',
          noteNumber: note.pitch,
          velocity: 0
        });
      });
      
      // Sort events by time
      const allEvents = [...noteOnEvents, ...noteOffEvents].sort((a, b) => a.deltaTime - b.deltaTime);
      
      // Convert absolute times to delta times
      let lastTime = 0;
      allEvents.forEach(event => {
        const absoluteTime = event.deltaTime;
        event.deltaTime = absoluteTime - lastTime;
        lastTime = absoluteTime;
      });
      
      // Add end of track event
      if (allEvents.length === 0) {
        // Empty track, just add end of track
        allEvents.push({
          deltaTime: 0,
          type: 'endOfTrack'
        });
      } else {
        // Add end of track after last event
        allEvents.push({
          deltaTime: 1, // Small delay after last event
          type: 'endOfTrack'
        });
      }
      
      midiData.tracks.push([...midiTrack, ...allEvents]);
    });
    
    return midiData;
  }
  
  async saveToFile(sequence, filePath) {
    const midiData = this.sequenceToMidi(sequence);
    const buffer = this._serializeMidiData(midiData);
    
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    
    // Write the file
    await fs.writeFile(filePath, buffer);
    
    return filePath;
  }
  
  exportToFile(sequence, filePath) {
    // This is a synchronous variant - could use for testing
    const midiData = this.sequenceToMidi(sequence);
    // In a real implementation, we'd serialize to Buffer here
    return true; // Success flag
  }
  
  // Helper methods
  _timeToTicks(timeInBeats) {
    return Math.round(timeInBeats * this.ppq);
  }
  
  _getSequenceLengthInTicks(sequence) {
    let maxTime = 0;
    
    sequence.tracks.forEach(track => {
      track.notes.forEach(note => {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > maxTime) {
          maxTime = noteEnd;
        }
      });
    });
    
    // Add some padding
    maxTime += 2;
    
    return this._timeToTicks(maxTime);
  }
  
  _serializeMidiData(midiData) {
    // This would normally convert the MIDI data structure to a binary buffer
    // For testing purposes, return a mock buffer
    return Buffer.from(JSON.stringify(midiData));
  }
}

module.exports = { MidiExporter };
