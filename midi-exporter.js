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
    
    // Add header data
    track.addTrackName(sequence.name || 'Unnamed Sequence');
    track.setTempo(sequence.tempo || 120);
    
    // Process notes
    if (sequence.notes && Array.isArray(sequence.notes) && sequence.notes.length > 0) {
      // Group notes by startTime to handle chords
      const noteGroups = {};
      
      sequence.notes.forEach(note => {
        if (!note || typeof note.pitch !== 'number') return;
        
        const startTime = note.startTime || 0;
        if (!noteGroups[startTime]) {
          noteGroups[startTime] = [];
        }
        
        noteGroups[startTime].push(note);
      });
      
      // Get sorted start times
      const startTimes = Object.keys(noteGroups)
        .map(Number)
        .sort((a, b) => a - b);
      
      // Process each time group
      startTimes.forEach(startTime => {
        const notes = noteGroups[startTime];
        
        // Skip empty groups
        if (!notes || notes.length === 0) return;
        
        // Process each channel separately
        const channelGroups = {};
        
        notes.forEach(note => {
          const channel = typeof note.channel === 'number' ? note.channel : 0;
          if (!channelGroups[channel]) {
            channelGroups[channel] = [];
          }
          channelGroups[channel].push(note);
        });
        
        // Add notes for each channel
        Object.entries(channelGroups).forEach(([channel, channelNotes]) => {
          const channelNum = parseInt(channel, 10);
          const midiChannel = channelNum + 1; // MIDI channels are 1-based
          
          // Set instrument
          if (channelNum === 9) {
            // Drum channel
            track.addEvent(new MidiWriter.ProgramChangeEvent({
              instrument: 0,
              channel: 10
            }));
          } else {
            // Regular instrument channel
            const instrument = channelNum === 1 ? 32 : 0; // Use bass for channel 1, piano for others
            track.addEvent(new MidiWriter.ProgramChangeEvent({
              instrument: instrument,
              channel: midiChannel
            }));
          }
          
          // Add all notes at this time for this channel
          channelNotes.forEach(note => {
            // Create note event
            const noteEvent = new MidiWriter.NoteEvent({
              pitch: [note.pitch], // Pitch must be an array
              duration: ['4'], // Use quarter note as default duration
              velocity: note.velocity || 100,
              channel: midiChannel
            });
            
            track.addEvent(noteEvent);
          });
        });
      });
    } else {
      // Add a silent note to prevent empty MIDI file
      const silentNote = new MidiWriter.NoteEvent({
        pitch: ['C4'],
        duration: ['4'],
        velocity: 0 // Silent
      });
      track.addEvent(silentNote);
    }
    
    // Create MIDI writer
    const writer = new MidiWriter.Writer([track]);
    
    // Build and return file
    const midiData = writer.buildFile();
    
    return Buffer.from(midiData);
  } catch (error) {
    console.error('Error creating MIDI file:', error);
    throw new Error(`Failed to create MIDI file: ${error.message}`);
  }
}

module.exports = {
  sequenceToMidiFile
};
