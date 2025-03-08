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
        
        // Add notes
        notes.forEach(note => {
          // Convert pitch to note name if needed
          const pitch = note.pitch;
          
          // Add note event
          const noteEvent = new MidiWriter.NoteEvent({
            pitch: pitch,
            duration: durationToTicks(note.duration),
            velocity: note.velocity || 100,
            channel: channelNum + 1, // MIDI channels are 1-based
          });
          
          // Add rest before note if needed
          if (note.startTime > 0) {
            const ticksPerBeat = 128; // Default ticks per beat in MidiWriter
            const startTicks = Math.round(note.startTime * ticksPerBeat);
            noteEvent.delta = startTicks;
          }
          
          track.addEvent(noteEvent);
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
 * Converts duration to MIDI ticks format
 * @param {number} duration - Duration in beats
 * @returns {string} - Duration in MIDI ticks format
 */
function durationToTicks(duration) {
  // Convert duration to a valid note duration format
  // This is a simplification - more precise conversion would be needed for complex rhythms
  if (duration >= 4) return 'w'; // Whole note
  if (duration >= 2) return 'h'; // Half note
  if (duration >= 1) return 'q'; // Quarter note
  if (duration >= 0.5) return '8'; // Eighth note
  if (duration >= 0.25) return '16'; // Sixteenth note
  return '32'; // Thirty-second note for shorter durations
}

module.exports = {
  sequenceToMidiFile
};
