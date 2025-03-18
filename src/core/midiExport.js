// src/core/midiExport.js
const MidiWriter = require('midi-writer-js');

/**
 * Exports a sequence to a MIDI file
 * @param {Object} sequence - The sequence to export
 * @returns {Buffer} - MIDI file data as a buffer
 */
function sequenceToMidiFile(sequence) {
  try {
    if (!sequence || !sequence.notes) {
      throw new Error('Invalid sequence provided for MIDI export');
    }

    // Create a new MIDI track
    const track = new MidiWriter.Track();

    // Set time signature if available
    if (sequence.timeSignature) {
      const numerator = sequence.timeSignature.numerator || 4;
      const denominator = sequence.timeSignature.denominator || 4;
      track.setTimeSignature(numerator, denominator);
    }

    // Set tempo if available (convert from BPM to microseconds per quarter note)
    if (sequence.tempo) {
      const tempo = sequence.tempo;
      const microsecondsPerBeat = Math.floor(60000000 / tempo);
      track.setTempo(microsecondsPerBeat);
    }

    // Group notes by channel
    const notesByChannel = {};
    
    sequence.notes.forEach(note => {
      const channel = note.channel || 0;
      if (!notesByChannel[channel]) {
        notesByChannel[channel] = [];
      }
      notesByChannel[channel].push(note);
    });

    // Add notes for each channel
    Object.keys(notesByChannel).forEach(channel => {
      const channelNotes = notesByChannel[channel];
      
      // Convert each note to MIDI format
      channelNotes.forEach(note => {
        const pitch = note.pitch;
        const startTime = note.startTime;
        const duration = note.duration;
        
        // Convert duration from beats to ticks (assuming 128 ticks per beat)
        const durationTicks = Math.max(1, Math.round(duration * 128));
        
        // Create note event
        const noteEvent = new MidiWriter.NoteEvent({
          pitch: [pitch],
          duration: 'T' + durationTicks,
          velocity: note.velocity || 100,
          channel: parseInt(channel),
          startTick: Math.round(startTime * 128)
        });
        
        track.addEvent(noteEvent);
      });
    });

    // Create a new MIDI writer with the track
    const writer = new MidiWriter.Writer([track]);
    
    // Get the MIDI data as a buffer
    const midiData = Buffer.from(writer.buildFile());
    
    return midiData;
  } catch (error) {
    console.error('Error generating MIDI file:', error);
    throw new Error(`Failed to generate MIDI file: ${error.message}`);
  }
}

/**
 * Exports a session to a MIDI file by using the current sequence
 * @param {Object} session - The session to export
 * @returns {Buffer} - MIDI file data as a buffer
 */
async function sessionToMidiFile(session) {
  try {
    if (!session) {
      throw new Error('Invalid session provided for MIDI export');
    }
    
    // Get the current sequence
    let sequence;
    
    if (session.getCurrentSequence) {
      // Use the method if available
      sequence = session.getCurrentSequence();
    } else if (session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId]) {
      // Direct access to the sequences object
      sequence = session.sequences[session.currentSequenceId];
    } else if (session.tracks && session.tracks.length > 0) {
      // Fall back to the first track
      const track = session.tracks[0];
      sequence = {
        name: track.name || 'Exported Track',
        tempo: session.bpm || 120,
        timeSignature: { 
          numerator: session.timeSignature ? session.timeSignature[0] : 4, 
          denominator: session.timeSignature ? session.timeSignature[1] : 4 
        },
        notes: track.notes || []
      };
    } else {
      throw new Error('No sequence or track found in session');
    }
    
    // Export the sequence
    return sequenceToMidiFile(sequence);
  } catch (error) {
    console.error('Error exporting session to MIDI:', error);
    throw new Error(`Failed to export session to MIDI: ${error.message}`);
  }
}

module.exports = {
  sequenceToMidiFile,
  sessionToMidiFile
};