// src/core/midiExport.js
const MidiWriter = require('midi-writer-js');

/**
 * Convert a session to a MIDI file
 * @param {Object} session - The session object
 * @returns {Buffer} - The MIDI file as a buffer
 */
function sessionToMidiFile(session) {
  return new Promise((resolve, reject) => {
    try {
      // Create a new MIDI writer track
      const tracks = [];
      
      // Process each track in the session
      session.tracks.forEach(track => {
        const midiTrack = new MidiWriter.Track();
        
        // Set track name
        midiTrack.addEvent(new MidiWriter.ProgramChangeEvent({
          instrument: track.instrument || 0,
          channel: track.id % 16  // Ensure channel is 0-15
        }));
        
        // Add notes
        (track.notes || []).forEach(note => {
          // Convert note to MIDI writer format
          midiTrack.addEvent(new MidiWriter.NoteEvent({
            pitch: note.pitch,
            duration: convertDurationToTicks(note.duration, session.bpm),
            velocity: note.velocity || 100,
            channel: track.id % 16,
            startTick: convertTimeToTicks(note.startTime, session.bpm)
          }));
        });
        
        tracks.push(midiTrack);
      });
      
      // Create a new MIDI writer
      const writer = new MidiWriter.Writer(tracks);
      
      // Set BPM if specified
      if (session.bpm) {
        writer.setTempo(session.bpm);
      }
      
      // Set time signature if available
      if (session.timeSignature && Array.isArray(session.timeSignature) && session.timeSignature.length === 2) {
        writer.setTimeSignature(session.timeSignature[0], session.timeSignature[1]);
      }
      
      // Get the MIDI data
      const midiData = writer.buildFile();
      
      // Convert to buffer
      const buffer = Buffer.from(midiData, 'base64');
      
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert a time value to MIDI ticks
 * @param {number} time - The time in quarter notes
 * @param {number} bpm - The tempo in beats per minute
 * @returns {number} - The time in MIDI ticks
 */
function convertTimeToTicks(time, bpm = 120) {
  // MIDI uses 960 ticks per quarter note by default
  return Math.round(time * 960);
}

/**
 * Convert a duration value to MIDI ticks format
 * @param {number} duration - The duration in quarter notes
 * @param {number} bpm - The tempo in beats per minute
 * @returns {string} - The duration in MIDI ticks format
 */
function convertDurationToTicks(duration, bpm = 120) {
  if (duration === 4) return '1'; // Whole note
  if (duration === 2) return '2'; // Half note
  if (duration === 1) return '4'; // Quarter note
  if (duration === 0.5) return '8'; // Eighth note
  if (duration === 0.25) return '16'; // Sixteenth note
  
  // For any other value, return it as ticks
  return Math.round(duration * 960).toString();
}

/**
 * Convert a MidiSequence object to a MIDI file
 * @param {Object} sequence - The MidiSequence object
 * @returns {Buffer} - The MIDI file as a buffer
 */
function sequenceToMidiFile(sequence) {
  // Adapt sequence format to session format for compatibility
  const session = {
    bpm: sequence.tempo || 120,
    timeSignature: Array.isArray(sequence.timeSignature) 
      ? sequence.timeSignature 
      : [sequence.timeSignature?.numerator || 4, sequence.timeSignature?.denominator || 4],
    tracks: []
  };
  
  // Organize notes by channel
  const channelMap = new Map();
  
  // Group notes by channel
  (sequence.notes || []).forEach(note => {
    const channel = note.channel || 0;
    
    if (!channelMap.has(channel)) {
      channelMap.set(channel, []);
    }
    
    channelMap.get(channel).push(note);
  });
  
  // Create tracks for each channel
  channelMap.forEach((notes, channel) => {
    session.tracks.push({
      id: channel + 1,
      name: `Track ${channel + 1}`,
      instrument: channel === 9 ? 0 : channel, // Channel 10 (index 9) is always drums
      notes
    });
  });
  
  return sessionToMidiFile(session);
}

module.exports = {
  sessionToMidiFile,
  sequenceToMidiFile
};
