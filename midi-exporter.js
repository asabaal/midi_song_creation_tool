/**
 * MIDI Exporter Module
 * Enhanced version with proper timing, duration and channel information
 */

const MidiWriter = require('midi-writer-js');

/**
 * Converts MIDI sequence to standard MIDI file data
 * @param {Object} sequence - MIDI sequence object
 * @returns {Buffer} - MIDI file data as a Buffer
 */
function sequenceToMidiFile(sequence) {
  try {
    console.log('Creating MIDI file...');
    
    // Create tracks for each channel (multi-track MIDI approach)
    const tracks = [];
    
    // Set tempo from sequence or default to 120 BPM
    const tempo = sequence.tempo || 120;
    
    // Get notes from sequence
    const notes = sequence.notes || [];
    console.log(`Total notes to process: ${notes.length}`);
    
    if (notes.length > 0) {
      // Group notes by channel
      const notesByChannel = {};
      
      notes.forEach(note => {
        if (!note || typeof note.pitch !== 'number') return;
        
        // Default to channel 0 if not specified
        const channel = typeof note.channel === 'number' ? note.channel : 0;
        
        if (!notesByChannel[channel]) {
          notesByChannel[channel] = [];
        }
        
        notesByChannel[channel].push(note);
      });
      
      // Process each channel
      Object.entries(notesByChannel).forEach(([channelStr, channelNotes]) => {
        const channel = parseInt(channelStr, 10);
        const midiChannel = channel + 1; // MIDI channels are 1-based
        
        console.log(`Processing ${channelNotes.length} notes for channel ${channel}`);
        
        // Create a track for this channel
        const track = new MidiWriter.Track();
        
        // Set tempo
        track.setTempo(tempo);
        
        // Set appropriate instrument for each channel
        try {
          // Drums are on channel 9 (MIDI channel 10)
          if (channel === 9) {
            track.addEvent(new MidiWriter.ProgramChangeEvent({
              instrument: 0, 
              channel: 10
            }));
          } 
          // Bass is on channel 1 (MIDI channel 2)
          else if (channel === 1) {
            track.addEvent(new MidiWriter.ProgramChangeEvent({
              instrument: 32, // Electric bass
              channel: 2
            }));
          }
          // Other channels default to piano
          else {
            track.addEvent(new MidiWriter.ProgramChangeEvent({
              instrument: 0, // Acoustic piano
              channel: midiChannel
            }));
          }
        } catch (e) {
          console.error(`Error setting instrument for channel ${channel}:`, e);
        }
        
        // Sort notes by start time
        const sortedNotes = [...channelNotes].sort((a, b) => 
          (a.startTime || 0) - (b.startTime || 0)
        );
        
        // Add notes in this channel
        sortedNotes.forEach(note => {
          try {
            const noteEvent = new MidiWriter.NoteEvent({
              pitch: [note.pitch],
              duration: getDuration(note.duration || 1),
              velocity: note.velocity || 100,
              channel: midiChannel,
              // Using the 'sequential' mode which automatically handles timing
              sequential: true
            });
            
            // Add to track
            track.addEvent(noteEvent);
            
            console.log(`Added note: pitch=${note.pitch}, duration=${note.duration}, channel=${midiChannel}`);
          } catch (e) {
            console.error('Error adding note:', e);
          }
        });
        
        // Add this track
        tracks.push(track);
      });
    } 
    
    // If no tracks were created, add a default track with a silent note
    if (tracks.length === 0) {
      console.log('No notes to export, adding dummy track');
      const dummyTrack = new MidiWriter.Track();
      dummyTrack.setTempo(tempo);
      
      const dummyEvent = new MidiWriter.NoteEvent({
        pitch: ['C4'],
        duration: ['4'],
        velocity: 0
      });
      
      dummyTrack.addEvent(dummyEvent);
      tracks.push(dummyTrack);
    }
    
    // Create writer and build file
    const writer = new MidiWriter.Writer(tracks);
    console.log(`Created MIDI file with ${tracks.length} tracks`);
    
    const midiData = writer.buildFile();
    
    return Buffer.from(midiData);
  } catch (error) {
    console.error('Error in MIDI export:', error);
    throw new Error(`MIDI export failed: ${error.message}`);
  }
}

/**
 * Converts duration value to MIDI duration format
 * @param {number} duration - Duration in beats
 * @returns {string[]} - Duration in MIDI format
 */
function getDuration(duration) {
  // Default to quarter note
  if (!duration || isNaN(duration) || duration <= 0) {
    return ['4'];
  }
  
  // Whole note (4 beats)
  if (duration >= 4) {
    return ['1'];
  }
  
  // Half note (2 beats)
  if (duration >= 2) {
    return ['2'];
  }
  
  // Quarter note (1 beat)
  if (duration >= 1) {
    return ['4'];
  }
  
  // Eighth note (0.5 beat)
  if (duration >= 0.5) {
    return ['8'];
  }
  
  // Sixteenth note (0.25 beat)
  if (duration >= 0.25) {
    return ['16'];
  }
  
  // Default to shortest common duration
  return ['16'];
}

module.exports = {
  sequenceToMidiFile
};
