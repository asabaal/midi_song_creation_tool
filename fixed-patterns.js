// Fixed implementations of pattern generators

// Export pattern generators with proper error handling
module.exports = {
  // Create random notes within a key/scale
  createRandomNotes: function(key, scaleType, octave, noteCount = 8, rhythmPattern = [1]) {
    if (!key || !scaleType) {
      console.error('Invalid key or scale type provided to createRandomNotes');
      return [];
    }
    
    // Define scales
    const SCALES = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      melodic_minor: [0, 2, 3, 5, 7, 9, 11],
      harmonic_minor: [0, 2, 3, 5, 7, 8, 11]
    };
    
    // Map key to MIDI note number (C4 = 60)
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = NOTE_NAMES.indexOf(key);
    if (keyIndex === -1) {
      console.error(`Invalid key: ${key}`);
      return [];
    }
    
    // Get scale intervals
    const scaleIntervals = SCALES[scaleType];
    if (!scaleIntervals) {
      console.error(`Invalid scale type: ${scaleType}`);
      return [];
    }
    
    // Generate scale notes
    const rootNote = keyIndex + (parseInt(octave) * 12);
    const scaleNotes = scaleIntervals.map(interval => rootNote + interval);
    
    // Add notes from adjacent octaves for more variety
    const lowerOctaveNotes = scaleIntervals.map(interval => rootNote - 12 + interval);
    const higherOctaveNotes = scaleIntervals.map(interval => rootNote + 12 + interval);
    const allScaleNotes = [...lowerOctaveNotes, ...scaleNotes, ...higherOctaveNotes];
    
    // Generate random notes
    const notes = [];
    let currentTime = 0;
    
    for (let i = 0; i < noteCount; i++) {
      // Get a random note from the scale
      const randomIndex = Math.floor(Math.random() * scaleNotes.length);
      const pitch = scaleNotes[randomIndex];
      
      // Get rhythm value from pattern or use default
      const rhythmValue = Array.isArray(rhythmPattern) && rhythmPattern.length > 0 
        ? rhythmPattern[i % rhythmPattern.length] 
        : 1; // Default to quarter note
      
      // Create note
      notes.push({
        pitch: pitch,
        startTime: currentTime,
        duration: rhythmValue,
        velocity: 70 + Math.floor(Math.random() * 30), // Random velocity between 70-100
        channel: 0
      });
      
      currentTime += rhythmValue;
    }
    
    return notes;
  },
  
  // Create random bassline within a key/scale
  createRandomBassline: function(key, scaleType, octave, noteCount = 8, rhythmPattern = [1, 0.5, 0.5]) {
    if (!key || !scaleType) {
      console.error('Invalid key or scale type provided to createRandomBassline');
      return [];
    }
    
    // Define scales
    const SCALES = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      melodic_minor: [0, 2, 3, 5, 7, 9, 11],
      harmonic_minor: [0, 2, 3, 5, 7, 8, 11]
    };
    
    // Map key to MIDI note number (C4 = 60)
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = NOTE_NAMES.indexOf(key);
    if (keyIndex === -1) {
      console.error(`Invalid key: ${key}`);
      return [];
    }
    
    // Get scale intervals
    const scaleIntervals = SCALES[scaleType];
    if (!scaleIntervals) {
      console.error(`Invalid scale type: ${scaleType}`);
      return [];
    }
    
    // Generate scale notes for bass (lower octave)
    const rootNote = keyIndex + (parseInt(octave) * 12);
    const scaleNotes = scaleIntervals.map(interval => rootNote + interval);
    
    // Generate random bass notes with emphasis on 1, 4, 5 scale degrees
    const notes = [];
    let currentTime = 0;
    
    // Ensure rhythmPattern is valid
    if (!Array.isArray(rhythmPattern) || rhythmPattern.length === 0) {
      rhythmPattern = [1, 0.5, 0.5];
    }
    
    // Use 1, 4, 5 scale degrees more frequently (root, subdominant, dominant)
    const emphasizedDegrees = [0, 3, 4]; // Indices of 1, 4, 5 in the scale
    
    for (let i = 0; i < noteCount; i++) {
      // Determine whether to use an emphasized note (70% chance)
      const useEmphasized = Math.random() < 0.7;
      
      let pitchIndex;
      if (useEmphasized) {
        // Choose from emphasized degrees
        const randomEmphIndex = Math.floor(Math.random() * emphasizedDegrees.length);
        pitchIndex = emphasizedDegrees[randomEmphIndex];
      } else {
        // Choose any scale degree
        pitchIndex = Math.floor(Math.random() * scaleNotes.length);
      }
      
      const pitch = scaleNotes[pitchIndex];
      
      // Get rhythm value
      const rhythmValue = rhythmPattern[i % rhythmPattern.length];
      
      // Create bass note
      notes.push({
        pitch: pitch,
        startTime: currentTime,
        duration: rhythmValue,
        velocity: 90, // Bass notes typically have higher velocity
        channel: 1 // Bass channel
      });
      
      currentTime += rhythmValue;
    }
    
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
      },
      jazz: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0],
        snare: [0, 0, 1, 0, 0, 1, 0, 0],
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
  }
};
