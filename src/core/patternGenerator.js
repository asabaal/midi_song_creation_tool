// src/core/patternGenerator.js

class ChordGenerator {
  constructor() {
    this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Define intervals for different chord types
    this.chordIntervals = {
      major: [0, 4, 7],       // Root, Major 3rd, Perfect 5th
      minor: [0, 3, 7],       // Root, Minor 3rd, Perfect 5th
      diminished: [0, 3, 6],  // Root, Minor 3rd, Diminished 5th
      augmented: [0, 4, 8],   // Root, Major 3rd, Augmented 5th
      sus2: [0, 2, 7],        // Root, Major 2nd, Perfect 5th
      sus4: [0, 5, 7],        // Root, Perfect 4th, Perfect 5th
      major7: [0, 4, 7, 11],  // Root, Major 3rd, Perfect 5th, Major 7th
      minor7: [0, 3, 7, 10]   // Root, Minor 3rd, Perfect 5th, Minor 7th
    };
    
    // Define common chord progressions by scale degree
    this.commonProgressions = {
      major: {
        'I-IV-V-I': ['I', 'IV', 'V', 'I'],
        'I-V-vi-IV': ['I', 'V', 'vi', 'IV'],
        'ii-V-I': ['ii', 'V', 'I']
      },
      minor: {
        'i-iv-v-i': ['i', 'iv', 'v', 'i'],
        'i-VI-III-VII': ['i', 'VI', 'III', 'VII'],
        'i-iv-VII-III': ['i', 'iv', 'VII', 'III']
      }
    };
    
    // Define scale degrees for major and minor keys
    this.scaleDegrees = {
      major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viio'],
      minor: ['i', 'iio', 'III', 'iv', 'v', 'VI', 'VII']
    };
  }
  
  noteToMidi(noteName, octave) {
    const noteIndex = this.noteNames.indexOf(noteName);
    if (noteIndex === -1) return null;
    
    return 12 * (octave + 1) + noteIndex;
  }
  
  generateChord(root, type, octave) {
    // If root is a string (e.g., 'C'), convert to MIDI note
    let rootNote = root;
    if (typeof root === 'string') {
      rootNote = this.noteToMidi(root, octave);
    }
    
    if (rootNote === null) {
      throw new Error(`Invalid root note: ${root}`);
    }
    
    const intervals = this.chordIntervals[type];
    if (!intervals) {
      throw new Error(`Invalid chord type: ${type}`);
    }
    
    // Generate chord notes based on intervals
    return intervals.map(interval => rootNote + interval);
  }
  
  generatePattern(options) {
    const {
      progression = ['I', 'IV', 'V', 'I'],
      key = 'C',
      type = 'major',
      octave = 4,
      duration = 1,
      pattern = 'block'
    } = options;
    
    // Generate chord progression
    const chords = this.generateProgression(progression, key, type, octave);
    
    // Apply pattern to each chord
    let result = [];
    
    chords.forEach((chord, chordIndex) => {
      switch (pattern) {
        case 'block':
          // Add all notes of the chord at the same time
          result.push({
            notes: chord,
            startTime: chordIndex * duration,
            duration: duration
          });
          break;
          
        case 'arpeggio':
          // Arpeggiate the chord (play notes one after another)
          chord.forEach((note, noteIndex) => {
            result.push({
              notes: [note],
              startTime: chordIndex * duration + (noteIndex * duration / chord.length),
              duration: duration / chord.length
            });
          });
          break;
          
        default:
          // Default to block chords
          result.push({
            notes: chord,
            startTime: chordIndex * duration,
            duration: duration
          });
      }
    });
    
    return result;
  }
  
  generateProgression(progression, key, type, octave) {
    // Convert key name to index
    const keyIndex = this.noteNames.indexOf(key);
    if (keyIndex === -1) {
      throw new Error(`Invalid key: ${key}`);
    }
    
    // Define scale notes for the given key
    const scaleType = type === 'major' ? 'major' : 'minor';
    const scaleIntervals = scaleType === 'major' 
      ? [0, 2, 4, 5, 7, 9, 11] // Major scale intervals
      : [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale intervals
    
    const scaleNotes = scaleIntervals.map(interval => (keyIndex + interval) % 12);
    
    // Map chord quality based on scale degree
    const chordQualities = scaleType === 'major'
      ? ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
      : ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    
    // Generate chords for each degree in the progression
    return progression.map(degree => {
      // Convert degree (e.g., 'I', 'ii', 'V') to scale index
      let degreeIndex;
      let chordType;
      
      if (degree.includes('o')) {
        // Diminished chord
        degreeIndex = this.scaleDegrees[scaleType].indexOf(degree);
        chordType = 'diminished';
      } else {
        // Regular scale degree
        const baseDegree = degree.replace(/[^IiVv]/g, '');
        degreeIndex = this.scaleDegrees[scaleType].indexOf(baseDegree);
        
        if (degreeIndex === -1) {
          throw new Error(`Invalid chord degree: ${degree}`);
        }
        
        chordType = chordQualities[degreeIndex];
      }
      
      // Get root note for this degree
      const rootNote = scaleNotes[degreeIndex];
      const rootNoteName = this.noteNames[rootNote];
      
      // Generate the chord
      return this.generateChord(rootNoteName, chordType, octave);
    });
  }
}

class BasslineGenerator {
  constructor() {
    // Initialize with common bassline patterns
    this.patterns = {
      simple: [0, 0, 0, 0],
      walking: [0, 4, 7, 9],
      octave: [0, 12, 0, 12],
      pentatonic: [0, 2, 4, 7]
    };
  }
  
  generatePattern(chordRoots, pattern = [0, 3, 7, 10], notesPerChord = 4, noteDuration = 0.25) {
    if (!chordRoots || chordRoots.length === 0) {
      return [];
    }
    
    // If pattern is a string, use predefined pattern
    const patternToUse = typeof pattern === 'string' ? this.patterns[pattern] : pattern;
    
    if (!patternToUse) {
      throw new Error(`Invalid pattern: ${pattern}`);
    }
    
    let bassline = [];
    
    // For each chord root, generate bass notes according to the pattern
    chordRoots.forEach((root, chordIndex) => {
      for (let i = 0; i < notesPerChord; i++) {
        // Use pattern in a cyclic manner
        const patternIndex = i % patternToUse.length;
        const offset = patternToUse[patternIndex];
        
        bassline.push({
          pitch: root - 12 + offset, // One octave down + pattern offset
          startTime: chordIndex * notesPerChord * noteDuration + i * noteDuration,
          duration: noteDuration,
          velocity: i === 0 ? 100 : 80 // Emphasize the first note of each chord
        });
      }
    });
    
    return bassline;
  }
  
  generateWalking(chordRoots, notesPerChord = 4, noteDuration = 0.25) {
    if (!chordRoots || chordRoots.length === 0) {
      return [];
    }
    
    let bassline = [];
    const walkingIntervals = [0, 2, 4, 5, 7, 9, 10, 12]; // Possible intervals for walking bass
    
    // For each chord root, generate walking bass notes
    chordRoots.forEach((root, chordIndex) => {
      let previousNote = root - 12; // Start one octave down
      
      for (let i = 0; i < notesPerChord; i++) {
        // First note of each chord is the root
        if (i === 0) {
          bassline.push({
            pitch: previousNote,
            startTime: chordIndex * notesPerChord * noteDuration + i * noteDuration,
            duration: noteDuration,
            velocity: 100
          });
        } else {
          // Choose a nearby note from the walkingIntervals
          const possibleIntervals = walkingIntervals.filter(interval =>
            Math.abs((previousNote + interval) - (root - 12)) <= 12 // Keep within an octave
          );
          
          // Select a random interval from possible ones
          const randomInterval = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
          const nextNote = previousNote + (Math.random() > 0.5 ? randomInterval : -randomInterval);
          
          bassline.push({
            pitch: nextNote,
            startTime: chordIndex * notesPerChord * noteDuration + i * noteDuration,
            duration: noteDuration,
            velocity: 80
          });
          
          previousNote = nextNote;
        }
      }
    });
    
    return bassline;
  }
}

class DrumPatternGenerator {
  constructor() {
    // Define standard drum note numbers
    this.drumNotes = {
      kick: 36,
      snare: 38,
      hihat: 42,
      openHihat: 46,
      tom1: 48,
      tom2: 45,
      tom3: 43,
      crash: 49,
      ride: 51
    };
  }
  
  generateBasicBeat(beats = 4, division = 4) {
    const totalSteps = beats * division;
    const stepDuration = 1 / division;
    
    // Initialize empty drum tracks
    const pattern = {
      kick: [],
      snare: [],
      hihat: [],
      openHihat: [],
      tom1: [],
      tom2: [],
      tom3: [],
      crash: [],
      ride: []
    };
    
    // Generate pattern based on time signature
    for (let step = 0; step < totalSteps; step++) {
      const startTime = step * stepDuration;
      
      // Kick drum on beat 1 and sometimes on beat 3
      if (step % division === 0 || (beats === 4 && step === division * 2)) {
        pattern.kick.push({
          pitch: this.drumNotes.kick,
          startTime: startTime,
          duration: stepDuration,
          velocity: step % division === 0 ? 100 : 80
        });
      }
      
      // Snare on beats 2 and 4 in 4/4, or beat 3 in 3/4
      if ((beats === 4 && (step === division || step === division * 3)) ||
          (beats === 3 && step === division * 2)) {
        pattern.snare.push({
          pitch: this.drumNotes.snare,
          startTime: startTime,
          duration: stepDuration,
          velocity: 90
        });
      }
      
      // Hi-hat on every step or every other step
      if (step % (division / 2) === 0) {
        pattern.hihat.push({
          pitch: this.drumNotes.hihat,
          startTime: startTime,
          duration: stepDuration,
          velocity: step % division === 0 ? 90 : 70
        });
      }
    }
    
    return pattern;
  }
  
  generateFill(bars = 1) {
    const totalSteps = bars * 16; // Assuming 16th notes
    const stepDuration = 1 / 16;
    
    // Initialize empty drum tracks for the fill
    const pattern = {
      kick: [],
      snare: [],
      tom1: [],
      tom2: [],
      tom3: [],
      crash: []
    };
    
    // Generate a drum fill
    // This is a simple example - real drum fills would be more complex
    for (let step = 0; step < totalSteps; step++) {
      const startTime = step * stepDuration;
      
      // Add some randomized tom hits
      if (step % 2 === 0) {
        const tomChoice = Math.floor(Math.random() * 3);
        const tom = tomChoice === 0 ? 'tom1' : tomChoice === 1 ? 'tom2' : 'tom3';
        
        pattern[tom].push({
          pitch: this.drumNotes[tom],
          startTime: startTime,
          duration: stepDuration,
          velocity: 80 + Math.floor(Math.random() * 20)
        });
      }
      
      // Add some snare hits
      if (step % 3 === 0) {
        pattern.snare.push({
          pitch: this.drumNotes.snare,
          startTime: startTime,
          duration: stepDuration,
          velocity: 90
        });
      }
      
      // Kick at the beginning and end
      if (step === 0 || step === totalSteps - 1) {
        pattern.kick.push({
          pitch: this.drumNotes.kick,
          startTime: startTime,
          duration: stepDuration,
          velocity: 100
        });
      }
    }
    
    // Add a crash at the end
    pattern.crash.push({
      pitch: this.drumNotes.crash,
      startTime: bars - stepDuration,
      duration: stepDuration * 2,
      velocity: 100
    });
    
    return pattern;
  }
}

module.exports = { 
  ChordGenerator, 
  BasslineGenerator, 
  DrumPatternGenerator 
};
