/**
 * MIDI Exporter Module
 * Converts sequences to standard MIDI files using a very simple approach
 */

const MidiWriter = require('midi-writer-js');

/**
 * Converts MIDI sequence to standard MIDI file data
 * @param {Object} sequence - MIDI sequence object
 * @returns {Buffer} - MIDI file data as a Buffer
 */
function sequenceToMidiFile(sequence) {
  try {
    // Create a MIDI track
    const track = new MidiWriter.Track();
    
    // Add minimal tempo setting
    track.setTempo(120);
    
    // Get notes from sequence
    const notes = sequence.notes || [];
    
    // Only process if we have notes
    if (notes.length > 0) {
      // Convert first 20 notes to MIDI (to keep it simple and working)
      const limitedNotes = notes.slice(0, 20);
      
      limitedNotes.forEach(note => {
        if (!note || typeof note.pitch !== 'number') return;
        
        try {
          // Create a simple note event
          const noteEvent = new MidiWriter.NoteEvent({
            pitch: [note.pitch], // Must be an array
            duration: ['4'],     // Quarter note for simplicity
            velocity: 100,       // Fixed velocity
            channel: 1           // Fixed channel
          });
          
          // Add to track
          track.addEvent(noteEvent);
        } catch (e) {
          console.error('Error adding note:', e);
        }
      });
    } else {
      // Add a dummy note to avoid empty file
      const dummyEvent = new MidiWriter.NoteEvent({
        pitch: ['C4'],
        duration: ['4'],
        velocity: 0
      });
      track.addEvent(dummyEvent);
    }
    
    // Create writer and build file
    const writer = new MidiWriter.Writer([track]);
    const midiData = writer.buildFile();
    
    return Buffer.from(midiData);
  } catch (error) {
    console.error('Error in MIDI export:', error);
    throw new Error(`Basic MIDI export failed: ${error.message}`);
  }
}

module.exports = {
  sequenceToMidiFile
};
