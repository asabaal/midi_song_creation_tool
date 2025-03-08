/**
 * MIDI Exporter Module
 * Converts sequences to standard MIDI files
 */

const MidiWriter = require('midi-writer-js');

/**
 * Converts MIDI sequence to standard MIDI file data
 * @param {Object} sequence - MIDI sequence object
 * @returns {Buffer} - MIDI file data as a Buffer
 */
function sequenceToMidiFile(sequence) {
  try {
    // Create a MIDI Writer track
    const track = new MidiWriter.Track();
    
    // Set tempo
    track.setTempo(sequence.tempo || 120);
    
    // Set time signature if available
    if (sequence.timeSignature) {
      const { numerator, denominator } = sequence.timeSignature;
      track.setTimeSignature(numerator, denominator);
    }
    
    // Process notes
    if (sequence.notes && Array.isArray(sequence.notes)) {
      // Group notes by channel
      const channelNotes = {};
      
      sequence.notes.forEach(note => {
        const channel = note.channel || 0;
        if (!channelNotes[channel]) {
          channelNotes[channel] = [];
        }
        channelNotes[channel].push(note);
      });
      
      // Add notes by channel
      Object.entries(channelNotes).forEach(([channel, notes]) => {
        // Set the instrument for the channel (use default program 0 for now)
        const channelNum = parseInt(channel);
        
        // Special handling for drum channel (channel 9)
        if (channelNum === 9) {
          track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 0, channel: 10}));
        } else {
          // Set a reasonable default instrument for each channel
          let instrument = 0; // Piano by default
          if (channelNum === 1) instrument = 32; // Bass
          track.addEvent(new MidiWriter.ProgramChangeEvent({instrument, channel: channelNum + 1}));
        }
        
        // Sort notes by start time
        notes.sort((a, b) => a.startTime - b.startTime);
        
        let currentTime = 0;
        
        // Add notes
        notes.forEach(note => {
          // Calculate wait time (delta) before this note
          const delta = note.startTime - currentTime;
          currentTime = note.startTime;
          
          // Add note event
          const noteEvent = new MidiWriter.NoteEvent({
            pitch: [note.pitch], // Note: pitch must be an array for midi-writer-js
            duration: durationToTicks(note.duration),
            velocity: note.velocity || 100,
            channel: channelNum + 1, // MIDI channels are 1-based
            wait: delta > 0 ? convertToTickDuration(delta) : undefined // Add wait if needed
          });
          
          track.addEvent(noteEvent);
          
          // Update current time to after this note
          currentTime = note.startTime + note.duration;
        });
      });
    }
    
    // Create a MIDI file with the track
    const writer = new MidiWriter.Writer([track]);
    
    // Get the MIDI file data as a Buffer
    return Buffer.from(writer.buildFile());
  } catch (error) {
    console.error('Error creating MIDI file:', error);
    throw new Error(`Failed to create MIDI file: ${error.message}`);
  }
}

/**
 * Converts note duration to MIDI duration string
 * @param {number} duration - Duration in beats
 * @returns {string} - Duration in MIDI format
 */
function durationToTicks(duration) {
  // Convert duration to a valid note duration format
  if (duration >= 4) return ['1']; // Whole note (4 beats)
  if (duration >= 2) return ['2']; // Half note (2 beats)
  if (duration >= 1) return ['4']; // Quarter note (1 beat)
  if (duration >= 0.5) return ['8']; // Eighth note (1/2 beat)
  if (duration >= 0.25) return ['16']; // Sixteenth note (1/4 beat)
  if (duration >= 0.125) return ['32']; // Thirty-second note (1/8 beat)
  
  // For unusual durations, use an array of dotted notes
  return calculateComplexDuration(duration);
}

/**
 * Calculates a complex duration for unusual note lengths
 * @param {number} duration - Duration in beats
 * @returns {string[]} - Array of durations that add up to the specified duration
 */
function calculateComplexDuration(duration) {
  // For very short notes, default to 32nd note
  if (duration < 0.125) {
    return ['32'];
  }
  
  // For unusual durations, try to use a combination of notes
  // This is a simplification - a more sophisticated algorithm could be implemented
  return ['8']; // Default to eighth note as a fallback
}

/**
 * Converts a time delta to a wait duration
 * @param {number} delta - Time to wait in beats
 * @returns {string[]} - Wait duration in MIDI format
 */
function convertToTickDuration(delta) {
  if (delta <= 0) return undefined;
  
  // Similar logic to durationToTicks but for wait time
  if (delta >= 4) return ['1']; // Whole note wait
  if (delta >= 2) return ['2']; // Half note wait
  if (delta >= 1) return ['4']; // Quarter note wait
  if (delta >= 0.5) return ['8']; // Eighth note wait
  if (delta >= 0.25) return ['16']; // Sixteenth note wait
  if (delta >= 0.125) return ['32']; // Thirty-second note wait
  
  // Default to smallest practical division for very short waits
  return ['32'];
}

module.exports = {
  sequenceToMidiFile
};
