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
    console.log('Creating MIDI file from sequence:', sequence.id);
    
    // Create a MIDI Writer track
    const track = new MidiWriter.Track();
    
    // Set tempo - default to 120 if not specified
    const tempo = sequence.tempo || 120;
    track.setTempo(tempo);
    console.log('Set tempo to:', tempo);
    
    // Set time signature if available
    if (sequence.timeSignature) {
      const { numerator, denominator } = sequence.timeSignature;
      if (numerator && denominator) {
        track.setTimeSignature(numerator, denominator);
        console.log('Set time signature to:', numerator, '/', denominator);
      }
    }
    
    // Process notes - make sure notes array exists and has elements
    if (sequence.notes && Array.isArray(sequence.notes) && sequence.notes.length > 0) {
      console.log('Processing', sequence.notes.length, 'notes');
      
      // Group notes by channel
      const channelNotes = {};
      
      sequence.notes.forEach(note => {
        if (!note) return; // Skip undefined notes
        
        // Ensure channel is a number
        const channel = typeof note.channel === 'number' ? note.channel : 0;
        
        if (!channelNotes[channel]) {
          channelNotes[channel] = [];
        }
        channelNotes[channel].push(note);
      });
      
      // Process each channel separately
      Object.entries(channelNotes).forEach(([channel, notes]) => {
        const channelNum = parseInt(channel, 10);
        console.log('Processing channel', channelNum, 'with', notes.length, 'notes');
        
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
        
        // Process each note
        notes.forEach(note => {
          try {
            // Validate pitch - must be a number
            if (typeof note.pitch !== 'number') {
              console.log('Skipping note with invalid pitch:', note);
              return;
            }
            
            // Create a simple note event
            const noteEvent = new MidiWriter.NoteEvent({
              pitch: [note.pitch], // Note: pitch must be an array
              duration: convertToMidiDuration(note.duration || 1),
              velocity: note.velocity || 100,
              channel: channelNum + 1,  // MIDI channels are 1-based
              startTick: Math.max(0, Math.floor(note.startTime * 128)) // Convert beats to ticks (128 ticks per beat)
            });
            
            track.addEvent(noteEvent);
            console.log('Added note', note.pitch, 'with duration', note.duration, 'at start time', note.startTime);
          } catch (noteError) {
            console.error('Error processing note:', noteError);
            // Continue with other notes
          }
        });
      });
    } else {
      console.log('No notes found in sequence or notes is not an array');
      // Add a single dummy note to avoid empty MIDI file
      const dummyNote = new MidiWriter.NoteEvent({
        pitch: ['C4'],
        duration: '4',
        velocity: 0
      });
      track.addEvent(dummyNote);
    }
    
    // Create a MIDI file with the track
    const writer = new MidiWriter.Writer([track]);
    
    // Get the MIDI file data as a Buffer
    const midiData = writer.buildFile();
    
    if (!midiData) {
      throw new Error('MidiWriter failed to build file - output is empty');
    }
    
    return Buffer.from(midiData);
  } catch (error) {
    console.error('Error creating MIDI file:', error);
    throw new Error(`Failed to create MIDI file: ${error.message}`);
  }
}

/**
 * Converts a duration value to MIDI duration format
 * @param {number} duration - Duration in beats
 * @returns {string[]} - Duration in MIDI format (array of duration strings)
 */
function convertToMidiDuration(duration) {
  if (duration === undefined || duration === null || isNaN(duration)) {
    return ['4']; // Default to quarter note if duration is invalid
  }
  
  // For whole notes (4 beats)
  if (duration >= 4) {
    return ['1'];
  }
  
  // For half notes (2 beats)
  if (duration >= 2) {
    return ['2'];
  }
  
  // For quarter notes (1 beat)
  if (duration >= 1) {
    return ['4'];
  }
  
  // For eighth notes (1/2 beat)
  if (duration >= 0.5) {
    return ['8'];
  }
  
  // For sixteenth notes (1/4 beat)
  if (duration >= 0.25) {
    return ['16'];
  }
  
  // For thirty-second notes (1/8 beat)
  if (duration >= 0.125) {
    return ['32'];
  }
  
  // For very short durations
  return ['32'];
}

module.exports = {
  sequenceToMidiFile
};
