/**
 * MIDI Exporter Module
 * Simple version with basic timing and channel information
 */

const MidiWriter = require('midi-writer-js');

/**
 * Converts MIDI sequence to standard MIDI file data
 * @param {Object} sequence - MIDI sequence object
 * @returns {Buffer} - MIDI file data as a Buffer
 */
function sequenceToMidiFile(sequence) {
  try {
    console.log('Exporting sequence to MIDI...');
    
    // Create a single track for simplicity
    const track = new MidiWriter.Track();
    
    // Set tempo from sequence or default to 120 BPM
    const tempo = sequence.tempo || 120;
    track.setTempo(tempo);
    console.log(`Tempo: ${tempo} BPM`);
    
    // Get notes from sequence
    const notes = sequence.notes || [];
    console.log(`Processing ${notes.length} notes`);
    
    if (notes.length > 0) {
      // Sort notes by start time
      const sortedNotes = [...notes]
        .filter(note => note && typeof note.pitch === 'number')
        .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
      
      // Create a simplified version that groups notes with the same start time
      const timeGroups = {};
      
      sortedNotes.forEach(note => {
        const startTime = Math.floor((note.startTime || 0) * 4) / 4; // Round to nearest quarter beat
        if (!timeGroups[startTime]) {
          timeGroups[startTime] = [];
        }
        timeGroups[startTime].push(note);
      });
      
      // Sort the time groups by start time
      const groupStartTimes = Object.keys(timeGroups).map(Number).sort((a, b) => a - b);
      
      console.log(`Created ${groupStartTimes.length} note groups`);
      
      // Add each group of notes
      let lastTime = 0;
      
      groupStartTimes.forEach(startTime => {
        const notes = timeGroups[startTime];
        if (!notes || notes.length === 0) return;
        
        // Calculate rest duration if needed
        const waitDuration = startTime - lastTime;
        
        // Add a rest if there's a significant gap
        if (waitDuration > 0.1) {
          try {
            // Add an explicit rest
            track.addEvent(new MidiWriter.NoteEvent({
              rest: true,
              duration: getDuration(waitDuration)
            }));
            console.log(`Added rest: ${waitDuration} beats`);
          } catch (e) {
            console.error('Error adding rest:', e);
          }
        }
        
        // Group notes by channel
        const channelGroups = {};
        
        notes.forEach(note => {
          const channel = typeof note.channel === 'number' ? note.channel : 0;
          if (!channelGroups[channel]) {
            channelGroups[channel] = [];
          }
          channelGroups[channel].push(note);
        });
        
        // Add notes for each channel
        Object.entries(channelGroups).forEach(([channelStr, channelNotes]) => {
          const channel = parseInt(channelStr, 10);
          const midiChannel = channel + 1; // MIDI channels are 1-based
          
          // Set instrument for channel (only add once per channel)
          if (!track.instruments || !track.instruments[midiChannel]) {
            try {
              // Mark that we've set an instrument for this channel
              if (!track.instruments) track.instruments = {};
              track.instruments[midiChannel] = true;
              
              // Set appropriate instrument
              track.addEvent(new MidiWriter.ProgramChangeEvent({
                instrument: channel === 9 ? 0 : (channel === 1 ? 32 : 0),
                channel: midiChannel
              }));
            } catch (e) {
              console.error(`Error setting instrument for channel ${midiChannel}:`, e);
            }
          }
          
          // Add all notes in this channel at this time
          channelNotes.forEach(note => {
            try {
              track.addEvent(new MidiWriter.NoteEvent({
                pitch: [note.pitch],
                duration: getDuration(note.duration || 1),
                velocity: note.velocity || 100,
                channel: midiChannel
              }));
            } catch (e) {
              console.error('Error adding note:', e);
            }
          });
        });
        
        // Update last time
        lastTime = startTime + Math.max(...notes.map(n => n.duration || 1));
      });
    } else {
      // Add a dummy note
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: ['C4'],
        duration: ['4'],
        velocity: 0
      }));
    }
    
    // Create writer and build file
    const writer = new MidiWriter.Writer([track]);
    const midiData = writer.buildFile();
    
    console.log('MIDI file created successfully');
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
  
  // Default to shortest duration
  return ['16'];
}

module.exports = {
  sequenceToMidiFile
};
