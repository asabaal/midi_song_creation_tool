// Fixed implementations of pattern generators

// Export pattern generators with proper error handling
module.exports = {
  // Create chord progression
  createChordProgression: function(progression, rhythmPattern = [1]) {
    if (!progression || !Array.isArray(progression)) {
      console.error('Invalid progression provided to createChordProgression');
      return [];
    }
    
    const notes = [];
    let currentTime = 0;
    
    progression.forEach((chord, i) => {
      if (!chord || !chord.notes) {
        console.warn(`Invalid chord at index ${i} in progression`);
        return; // Skip this chord
      }
      
      const rhythmValue = Array.isArray(rhythmPattern) && rhythmPattern.length > 0 
        ? rhythmPattern[i % rhythmPattern.length] 
        : 4; // Default to whole note
      
      // Add each note in the chord
      chord.notes.forEach(pitch => {
        notes.push({
          pitch: pitch,
          startTime: currentTime,
          duration: rhythmValue,
          velocity: 80,
          channel: 0
        });
      });
      
      currentTime += rhythmValue;
    });
    
    return notes;
  },
  
  // Create bassline pattern
  createBassline: function(progression, rhythmPattern = [1, 0.5, 0.5]) {
    if (!progression || !Array.isArray(progression)) {
      console.error('Invalid progression provided to createBassline');
      return [
        { pitch: 36, startTime: 0, duration: 1, velocity: 90, channel: 1 },
        { pitch: 48, startTime: 1, duration: 1, velocity: 90, channel: 1 }
      ];
    }
    
    const notes = [];
    let currentTime = 0;
    
    // Ensure rhythmPattern is valid
    if (!Array.isArray(rhythmPattern) || rhythmPattern.length === 0) {
      rhythmPattern = [1, 0.5, 0.5];
    }
    
    progression.forEach((chord, chordIndex) => {
      if (!chord || !chord.notes || chord.notes.length === 0) {
        console.warn(`Invalid chord at index ${chordIndex} in progression`);
        return; // Skip this chord
      }
      
      // Use root note of chord for bassline
      const rootNote = chord.notes[0] - 12; // Down an octave
      
      // Apply rhythm pattern
      rhythmPattern.forEach((duration) => {
        notes.push({
          pitch: rootNote,
          startTime: currentTime,
          duration: duration,
          velocity: 90,
          channel: 1 // Bass channel
        });
        currentTime += duration;
      });
    });
    
    return notes;
  },
  
  // Create drum pattern
  createDrumPattern: function(patternType = 'basic', measures = 2) {
    const notes = [];
    const beatsPerMeasure = 4; // Assuming 4/4 time
    
    // MIDI drum note numbers
    const DRUMS = {
      KICK: 36,
      SNARE: 38,
      HIHAT: 42,
      OPEN_HIHAT: 46
    };
    
    // Define patterns
    const patterns = {
      basic: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0]
      },
      rock: {
        kick: [1, 0, 0, 1, 1, 0, 0, 1],
        snare: [0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1]
      },
      funk: {
        kick: [1, 0, 0, 1, 0, 1, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1]
      }
    };
    
    // Use requested pattern or default to basic
    const pattern = patterns[patternType] || patterns.basic;
    
    // Create drum notes for all measures
    for (let measure = 0; measure < measures; measure++) {
      const measureStartTime = measure * beatsPerMeasure;
      
      // Generate one measure of drums (8 eighth notes)
      for (let i = 0; i < 8; i++) {
        const time = measureStartTime + (i * 0.5); // 0.5 = eighth note duration
        
        // Add kick
        if (pattern.kick[i]) {
          notes.push({
            pitch: DRUMS.KICK,
            startTime: time,
            duration: 0.25,
            velocity: 100,
            channel: 9 // Drum channel
          });
        }
        
        // Add snare
        if (pattern.snare[i]) {
          notes.push({
            pitch: DRUMS.SNARE,
            startTime: time,
            duration: 0.25,
            velocity: 90,
            channel: 9
          });
        }
        
        // Add hi-hat
        if (pattern.hihat[i]) {
          notes.push({
            pitch: DRUMS.HIHAT,
            startTime: time,
            duration: 0.25,
            velocity: 80,
            channel: 9
          });
        }
      }
    }
    
    return notes;
  },
  
  // Create arpeggio
  createArpeggio: function(chordNotes, octaveRange = 1, pattern = 'up', noteDuration = 0.25, startTime = 0, repeats = 1) {
    if (!chordNotes || !Array.isArray(chordNotes) || chordNotes.length === 0) {
      console.error('Invalid chord notes provided to createArpeggio');
      return [
        { pitch: 60, startTime: 0, duration: 0.25, velocity: 80, channel: 0 },
        { pitch: 64, startTime: 0.25, duration: 0.25, velocity: 80, channel: 0 },
        { pitch: 67, startTime: 0.5, duration: 0.25, velocity: 80, channel: 0 }
      ];
    }
    
    const notes = [];
    let currentTime = startTime;
    
    // Expand chord notes across octave range
    let allPitches = [];
    for (let octave = 0; octave < octaveRange; octave++) {
      chordNotes.forEach(pitch => {
        allPitches.push(pitch + (octave * 12));
      });
    }
    
    // Create different pattern types
    let patternPitches;
    switch (pattern) {
      case 'down':
        patternPitches = [...allPitches].sort((a, b) => b - a);
        break;
      case 'updown':
        const ascending = [...allPitches].sort((a, b) => a - b);
        const descending = [...allPitches].sort((a, b) => b - a).slice(1); // Remove duplicated top note
        patternPitches = [...ascending, ...descending];
        break;
      case 'random':
        patternPitches = [...allPitches].sort(() => Math.random() - 0.5);
        break;
      case 'up':
      default:
        patternPitches = [...allPitches].sort((a, b) => a - b);
    }
    
    // Create arpeggio notes
    for (let i = 0; i < repeats; i++) {
      patternPitches.forEach(pitch => {
        notes.push({
          pitch: pitch,
          startTime: currentTime,
          duration: noteDuration,
          velocity: 80,
          channel: 0
        });
        currentTime += noteDuration;
      });
    }
    
    return notes;
  },
  
  // Create rhythmic pattern
  createRhythmicPattern: function(noteValues, notePitches, startTime = 0, repeats = 1) {
    if (!noteValues || !Array.isArray(noteValues) || noteValues.length === 0 ||
        !notePitches || !Array.isArray(notePitches) || notePitches.length === 0) {
      console.error('Invalid parameters provided to createRhythmicPattern');
      return [
        { pitch: 60, startTime: 0, duration: 0.5, velocity: 80, channel: 0 },
        { pitch: 60, startTime: 0.5, duration: 0.5, velocity: 80, channel: 0 }
      ];
    }
    
    const notes = [];
    let currentTime = startTime;
    
    for (let i = 0; i < repeats; i++) {
      for (let j = 0; j < noteValues.length; j++) {
        const duration = noteValues[j];
        
        // Skip rests (negative duration)
        if (duration > 0) {
          // Get the pitch or pitches for this note
          let pitches;
          if (Array.isArray(notePitches[j % notePitches.length])) {
            // It's a chord
            pitches = notePitches[j % notePitches.length];
          } else {
            // It's a single note
            pitches = [notePitches[j % notePitches.length]];
          }
          
          // Create a note for each pitch
          pitches.forEach(pitch => {
            notes.push({
              pitch: pitch,
              startTime: currentTime,
              duration: duration,
              velocity: 80,
              channel: 0
            });
          });
        }
        
        // Move time forward (use absolute value to account for rests)
        currentTime += Math.abs(duration);
      }
    }
    
    return notes;
  }
};
