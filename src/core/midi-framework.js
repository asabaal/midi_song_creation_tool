// This file is combined from midi-framework.js in the develop branch
// It contains core functionality for MIDI manipulation, music theory, and pattern generation

// Music Theory Module
const MusicTheory = {
  // Note names and octaves
  NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  
  // Convert MIDI note number to note name
  getNoteName: function(midiNote) {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = this.NOTE_NAMES[midiNote % 12];
    return `${noteName}${octave}`;
  },
  
  // Convert note name to MIDI note number
  getNoteNumber: function(noteName) {
    const regex = /([A-G][#b]?)(\d+)/;
    const match = regex.exec(noteName);
    
    if (!match) {
      throw new Error(`Invalid note name: ${noteName}`);
    }
    
    const [, note, octave] = match;
    const noteIndex = this.NOTE_NAMES.indexOf(note);
    
    if (noteIndex === -1) {
      throw new Error(`Invalid note name: ${note}`);
    }
    
    return noteIndex + (parseInt(octave) + 1) * 12;
  },
  
  // Scale patterns (intervals from root)
  SCALES: {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor': [0, 2, 3, 5, 7, 8, 10],
    'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
    'melodic minor': [0, 2, 3, 5, 7, 9, 11],
    'pentatonic major': [0, 2, 4, 7, 9],
    'pentatonic minor': [0, 3, 5, 7, 10],
    'blues': [0, 3, 5, 6, 7, 10],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'locrian': [0, 1, 3, 5, 6, 8, 10]
  },
  
  // Chord types (intervals from root)
  CHORDS: {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'diminished': [0, 3, 6],
    'augmented': [0, 4, 8],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'major7': [0, 4, 7, 11],
    'minor7': [0, 3, 7, 10],
    'dominant7': [0, 4, 7, 10],
    'diminished7': [0, 3, 6, 9],
    'augmented7': [0, 4, 8, 10],
    'halfDiminished7': [0, 3, 6, 10],
    'minorMajor7': [0, 3, 7, 11]
  },
  
  // Generate a scale
  generateScale: function(root, scaleType, octave = 4) {
    if (typeof root === 'string') {
      // Extract the note name and octave from the root
      // e.g., "C4" -> root = "C", octave = 4
      const match = root.match(/([A-G][#b]?)(\d+)?/);
      if (match) {
        root = match[1];
        if (match[2]) {
          octave = parseInt(match[2]);
        }
      }
    }
    
    // Get the scale pattern
    const pattern = this.SCALES[scaleType.toLowerCase()];
    if (!pattern) {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }
    
    // Calculate the root note MIDI number
    let rootNote;
    if (typeof root === 'number') {
      rootNote = root;
    } else {
      rootNote = this.NOTE_NAMES.indexOf(root);
      if (rootNote === -1) {
        throw new Error(`Invalid root note: ${root}`);
      }
      rootNote += octave * 12;
    }
    
    // Generate the scale
    return pattern.map(interval => rootNote + interval);
  },
  
  // Generate a chord
  generateChord: function(root, chordType, octave = 4) {
    if (typeof root === 'string') {
      // Extract the note name and octave from the root
      // e.g., "C4" -> root = "C", octave = 4
      const match = root.match(/([A-G][#b]?)(\d+)?/);
      if (match) {
        root = match[1];
        if (match[2]) {
          octave = parseInt(match[2]);
        }
      }
    }
    
    // Get the chord pattern
    const pattern = this.CHORDS[chordType.toLowerCase()];
    if (!pattern) {
      throw new Error(`Unknown chord type: ${chordType}`);
    }
    
    // Calculate the root note MIDI number
    let rootNote;
    if (typeof root === 'number') {
      rootNote = root;
    } else {
      rootNote = this.NOTE_NAMES.indexOf(root);
      if (rootNote === -1) {
        throw new Error(`Invalid root note: ${root}`);
      }
      rootNote += octave * 12;
    }
    
    // Generate the chord
    return pattern.map(interval => rootNote + interval);
  },
  
  // Common chord progressions
  PROGRESSIONS: {
    'major': {
      '1-4-5': ['I', 'IV', 'V'],
      '1-5-6-4': ['I', 'V', 'vi', 'IV'],
      '1-6-4-5': ['I', 'vi', 'IV', 'V'],
      '2-5-1': ['ii', 'V', 'I'],
      '1-4-6-5': ['I', 'IV', 'vi', 'V']
    },
    'minor': {
      '1-4-5': ['i', 'iv', 'V'],
      '1-6-4-5': ['i', 'VI', 'iv', 'V'],
      '1-4-6-5': ['i', 'iv', 'VI', 'V'],
      '2-5-1': ['ii°', 'V', 'i'],
      '1-6-3-7': ['i', 'VI', 'III', 'VII']
    }
  },
  
  // Roman numeral to scale degree mapping
  ROMAN_TO_DEGREE: {
    'I': 0, 'i': 0,
    'II': 1, 'ii': 1, 'ii°': 1,
    'III': 2, 'iii': 2,
    'IV': 3, 'iv': 3,
    'V': 4, 'v': 4,
    'VI': 5, 'vi': 5,
    'VII': 6, 'vii': 6, 'vii°': 6
  },
  
  // Generate a chord progression
  generateProgression: function(key, octave, progressionName, mode = 'major') {
    // Get the progression pattern
    let pattern;
    
    if (Array.isArray(progressionName)) {
      pattern = progressionName;
    } else if (typeof progressionName === 'string') {
      // Check if it's a predefined progression
      const predefined = this.PROGRESSIONS[mode.toLowerCase()]?.[progressionName];
      
      if (predefined) {
        pattern = predefined;
      } else {
        // Parse custom progression (e.g., "I-IV-V")
        pattern = progressionName.split('-');
      }
    } else {
      throw new Error('Invalid progression format');
    }
    
    // Generate the scale for the key
    const scaleNotes = this.generateScale(key, mode, octave);
    
    // Generate chords for each degree in the progression
    return pattern.map(degree => {
      // Get the scale degree
      const scaleIndex = this.ROMAN_TO_DEGREE[degree];
      
      if (scaleIndex === undefined) {
        throw new Error(`Invalid chord symbol: ${degree}`);
      }
      
      // Get the root note of the chord
      const rootNote = scaleNotes[scaleIndex];
      const rootName = this.getNoteName(rootNote).replace(/\d+$/, '');
      
      // Determine chord type based on the mode and degree
      let chordType;
      
      if (mode.toLowerCase() === 'major') {
        // In major keys
        if (degree === 'I' || degree === 'IV' || degree === 'V') {
          chordType = 'major';
        } else if (degree === 'ii' || degree === 'iii' || degree === 'vi') {
          chordType = 'minor';
        } else if (degree === 'vii°') {
          chordType = 'diminished';
        } else {
          chordType = 'major'; // Default
        }
      } else {
        // In minor keys
        if (degree === 'i' || degree === 'iv') {
          chordType = 'minor';
        } else if (degree === 'III' || degree === 'VI' || degree === 'VII') {
          chordType = 'major';
        } else if (degree === 'ii°' || degree === 'vii°') {
          chordType = 'diminished';
        } else if (degree === 'V') {
          chordType = 'major'; // Harmonic minor
        } else {
          chordType = 'minor'; // Default
        }
      }
      
      // Generate the chord
      const chordOctave = Math.floor(rootNote / 12) - 1;
      const notes = this.generateChord(rootName, chordType, chordOctave);
      
      return {
        root: rootName,
        octave: chordOctave,
        chordType,
        notes
      };
    });
  },
  
  // Get key signature (number of sharps/flats)
  getKeySignature: function(key) {
    const keyRegex = /([A-G][#b]?)\s*(major|minor|maj|min|M|m)?/i;
    const match = key.match(keyRegex);
    
    if (!match) {
      throw new Error(`Invalid key format: ${key}`);
    }
    
    const [, root, modeStr] = match;
    const mode = modeStr ? 
      (modeStr.toLowerCase().startsWith('m') ? 'minor' : 'major') : 
      'major';
    
    // Order of sharps: F C G D A E B
    // Order of flats: B E A D G C F
    
    const sharpKeys = {
      'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7
    };
    
    const flatKeys = {
      'C': 0, 'F': 1, 'Bb': 2, 'Eb': 3, 'Ab': 4, 'Db': 5, 'Gb': 6, 'Cb': 7
    };
    
    // Adjust for relative minor (minor key is 3 semitones below its relative major)
    let adjustedRoot = root;
    if (mode === 'minor') {
      const rootIndex = this.NOTE_NAMES.indexOf(root);
      if (rootIndex !== -1) {
        const relativeMajorIndex = (rootIndex + 3) % 12;
        adjustedRoot = this.NOTE_NAMES[relativeMajorIndex];
      }
    }
    
    let sharps = 0;
    let flats = 0;
    
    if (sharpKeys[adjustedRoot] !== undefined) {
      sharps = sharpKeys[adjustedRoot];
    } else if (flatKeys[adjustedRoot] !== undefined) {
      flats = flatKeys[adjustedRoot];
    }
    
    return {
      root,
      mode,
      sharps,
      flats,
      accidentals: sharps > 0 ? `${sharps} sharp(s)` : `${flats} flat(s)`
    };
  }
};

// MidiNote class
class MidiNote {
  constructor(pitch, startTime, duration, velocity = 80, channel = 0) {
    this.pitch = pitch;
    this.startTime = startTime;
    this.duration = duration;
    this.velocity = velocity;
    this.channel = channel;
  }
  
  // Get note name
  getNoteName() {
    return MusicTheory.getNoteName(this.pitch);
  }
  
  // Get end time
  getEndTime() {
    return this.startTime + this.duration;
  }
  
  // Clone note
  clone() {
    return new MidiNote(
      this.pitch,
      this.startTime,
      this.duration,
      this.velocity,
      this.channel
    );
  }
  
  // Transpose note
  transpose(semitones) {
    this.pitch += semitones;
    return this;
  }
  
  // Move in time
  move(timeOffset) {
    this.startTime += timeOffset;
    return this;
  }
  
  // Resize note
  resize(newDuration) {
    this.duration = newDuration;
    return this;
  }
  
  // Serialize to JSON
  toJSON() {
    return {
      pitch: this.pitch,
      startTime: this.startTime,
      duration: this.duration,
      velocity: this.velocity,
      channel: this.channel
    };
  }
  
  // Create from JSON
  static fromJSON(json) {
    return new MidiNote(
      json.pitch,
      json.startTime,
      json.duration,
      json.velocity,
      json.channel
    );
  }
}

// MidiSequence class
class MidiSequence {
  constructor(options = {}) {
    this.id = options.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    this.name = options.name || 'Untitled Sequence';
    this.notes = [];
    this.timeSignature = options.timeSignature || { numerator: 4, denominator: 4 };
    this.tempo = options.tempo || 120;
    this.key = options.key || 'C major';
  }
  
  // Add note
  addNote(note) {
    if (note instanceof MidiNote) {
      this.notes.push(note);
    } else {
      this.notes.push(new MidiNote(
        note.pitch,
        note.startTime,
        note.duration,
        note.velocity,
        note.channel
      ));
    }
    return this;
  }
  
  // Add multiple notes
  addNotes(notes) {
    if (Array.isArray(notes)) {
      notes.forEach(note => this.addNote(note));
    }
    return this;
  }
  
  // Remove note
  removeNote(index) {
    if (index >= 0 && index < this.notes.length) {
      this.notes.splice(index, 1);
    }
    return this;
  }
  
  // Clear all notes
  clear() {
    this.notes = [];
    return this;
  }
  
  // Get note by index
  getNote(index) {
    return this.notes[index];
  }
  
  // Get all notes
  getNotes() {
    return this.notes;
  }
  
  // Get notes by channel
  getNotesByChannel(channel) {
    return this.notes.filter(note => note.channel === channel);
  }
  
  // Get sequence duration
  getDuration() {
    if (this.notes.length === 0) {
      return 0;
    }
    
    return Math.max(...this.notes.map(note => note.getEndTime()));
  }
  
  // Sort notes by start time
  sortNotes() {
    this.notes.sort((a, b) => a.startTime - b.startTime);
    return this;
  }
  
  // Quantize notes
  quantize(division = 0.25) {
    this.notes.forEach(note => {
      note.startTime = Math.round(note.startTime / division) * division;
      note.duration = Math.max(division, Math.round(note.duration / division) * division);
    });
    return this;
  }
  
  // Transpose all notes
  transpose(semitones) {
    this.notes.forEach(note => note.transpose(semitones));
    return this;
  }
  
  // Serialize to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      timeSignature: this.timeSignature,
      tempo: this.tempo,
      key: this.key,
      notes: this.notes.map(note => note.toJSON())
    };
  }
  
  // Create from JSON
  static fromJSON(json) {
    const parsedJson = typeof json === 'string' ? JSON.parse(json) : json;
    
    const sequence = new MidiSequence({
      id: parsedJson.id,
      name: parsedJson.name,
      timeSignature: parsedJson.timeSignature,
      tempo: parsedJson.tempo,
      key: parsedJson.key
    });
    
    if (Array.isArray(parsedJson.notes)) {
      parsedJson.notes.forEach(noteData => {
        sequence.addNote(MidiNote.fromJSON(noteData));
      });
    }
    
    return sequence;
  }
}

// Pattern Generators
const PatternGenerators = {
  // Create chord progression
  createChordProgression: function(progression, rhythmPattern = [1]) {
    const notes = [];
    let currentTime = 0;
    
    if (!progression || !Array.isArray(progression)) {
      throw new Error('Invalid progression format');
    }
    
    progression.forEach((chord, index) => {
      if (!chord || !chord.notes || !Array.isArray(chord.notes)) {
        throw new Error(`Invalid chord at index ${index}`);
      }
      
      // Get rhythm value for this chord
      const rhythmValue = Array.isArray(rhythmPattern) ? 
        rhythmPattern[index % rhythmPattern.length] : 1;
      
      // Add notes for this chord
      chord.notes.forEach(pitch => {
        notes.push(new MidiNote(
          pitch,
          currentTime,
          rhythmValue,
          80, // Velocity
          0  // Channel 0 (Piano)
        ));
      });
      
      // Move to next chord
      currentTime += rhythmValue;
    });
    
    return notes;
  },
  
  // Create bassline
  createBassline: function(progression, rhythmPattern = [1, 0.5, 0.5]) {
    const notes = [];
    let currentTime = 0;
    
    if (!progression || !Array.isArray(progression)) {
      throw new Error('Invalid progression format');
    }
    
    progression.forEach(chord => {
      if (!chord || !chord.notes || !Array.isArray(chord.notes) || chord.notes.length === 0) {
        throw new Error('Invalid chord format');
      }
      
      // Use root note, one octave lower
      const rootNote = chord.notes[0] - 12;
      
      if (Array.isArray(rhythmPattern)) {
        // Apply rhythm pattern
        rhythmPattern.forEach(duration => {
          notes.push(new MidiNote(
            rootNote,
            currentTime,
            duration,
            90, // Velocity
            1  // Channel 1 (Bass)
          ));
          
          currentTime += duration;
        });
      }
    });
    
    return notes;
  },
  
  // Create drum pattern
  createDrumPattern: function(patternType = 'basic', measures = 2) {
    const notes = [];
    
    // Define different pattern types
    const patterns = {
      'basic': () => {
        // Add kick drum on beats 1 and 3
        for (let m = 0; m < measures; m++) {
          notes.push(new MidiNote(36, m * 4, 0.25, 100, 9)); // Beat 1
          notes.push(new MidiNote(36, m * 4 + 2, 0.25, 100, 9)); // Beat 3
          
          // Add snare on beats 2 and 4
          notes.push(new MidiNote(38, m * 4 + 1, 0.25, 90, 9)); // Beat 2
          notes.push(new MidiNote(38, m * 4 + 3, 0.25, 90, 9)); // Beat 4
          
          // Add hi-hat on all eighth notes
          for (let i = 0; i < 8; i++) {
            notes.push(new MidiNote(42, m * 4 + i * 0.5, 0.25, 80, 9));
          }
        }
      },
      
      'rock': () => {
        // Add kick drum pattern
        for (let m = 0; m < measures; m++) {
          notes.push(new MidiNote(36, m * 4, 0.25, 100, 9)); // Beat 1
          notes.push(new MidiNote(36, m * 4 + 0.75, 0.25, 90, 9)); // And of 1
          notes.push(new MidiNote(36, m * 4 + 2, 0.25, 95, 9)); // Beat 3
          notes.push(new MidiNote(36, m * 4 + 2.75, 0.25, 90, 9)); // And of 3
          
          // Add snare on beats 2 and 4
          notes.push(new MidiNote(38, m * 4 + 1, 0.25, 100, 9)); // Beat 2
          notes.push(new MidiNote(38, m * 4 + 3, 0.25, 100, 9)); // Beat 4
          
          // Add hi-hat on all eighth notes
          for (let i = 0; i < 8; i++) {
            notes.push(new MidiNote(42, m * 4 + i * 0.5, 0.25, 80, 9));
          }
        }
      },
      
      'funk': () => {
        // Add kick drum pattern
        for (let m = 0; m < measures; m++) {
          notes.push(new MidiNote(36, m * 4, 0.25, 100, 9)); // Beat 1
          notes.push(new MidiNote(36, m * 4 + 1.5, 0.25, 90, 9)); // And of 2
          notes.push(new MidiNote(36, m * 4 + 2.75, 0.25, 95, 9)); // And of 3
          
          // Add snare on beats 2 and 4
          notes.push(new MidiNote(38, m * 4 + 1, 0.25, 100, 9)); // Beat 2
          notes.push(new MidiNote(38, m * 4 + 3, 0.25, 100, 9)); // Beat 4
          
          // Add hi-hat pattern
          for (let i = 0; i < 16; i++) {
            // Sixteenth notes
            notes.push(new MidiNote(
              42, 
              m * 4 + i * 0.25, 
              0.125, 
              i % 2 === 0 ? 90 : 70, // Accent on eighths
              9
            ));
          }
          
          // Add tambourine accents
          notes.push(new MidiNote(54, m * 4 + 0.5, 0.125, 70, 9));
          notes.push(new MidiNote(54, m * 4 + 1.5, 0.125, 70, 9));
          notes.push(new MidiNote(54, m * 4 + 2.5, 0.125, 70, 9));
          notes.push(new MidiNote(54, m * 4 + 3.5, 0.125, 70, 9));
        }
      }
    };
    
    // Generate notes based on pattern type
    if (patterns[patternType]) {
      patterns[patternType]();
    } else {
      // Default to basic pattern
      patterns.basic();
    }
    
    return notes;
  },
  
  // Create arpeggios
  createArpeggio: function(chordNotes, octaveRange = 1, pattern = 'up', noteDuration = 0.25, startTime = 0, repeats = 1) {
    if (!chordNotes || !Array.isArray(chordNotes)) {
      throw new Error('Invalid chord notes');
    }
    
    const notes = [];
    let time = startTime;
    
    // Expand chord notes across octave range
    let expandedNotes = [...chordNotes];
    
    for (let o = 1; o < octaveRange; o++) {
      expandedNotes = expandedNotes.concat(
        chordNotes.map(note => note + (o * 12))
      );
    }
    
    // Create pattern sequence
    let sequence;
    
    switch (pattern.toLowerCase()) {
      case 'up':
        sequence = expandedNotes.sort((a, b) => a - b);
        break;
      case 'down':
        sequence = expandedNotes.sort((a, b) => b - a);
        break;
      case 'updown':
        const ascending = expandedNotes.sort((a, b) => a - b);
        // Exclude highest note from descending to avoid repetition
        const descending = [...ascending].slice(0, -1).reverse();
        sequence = [...ascending, ...descending];
        break;
      case 'random':
        sequence = [...expandedNotes];
        // Fisher-Yates shuffle
        for (let i = sequence.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        break;
      default:
        sequence = expandedNotes.sort((a, b) => a - b);
    }
    
    // Generate notes
    for (let r = 0; r < repeats; r++) {
      sequence.forEach(pitch => {
        notes.push(new MidiNote(
          pitch,
          time,
          noteDuration,
          80,
          0 // Channel 0 (Piano)
        ));
        
        time += noteDuration;
      });
    }
    
    return notes;
  },
  
  // Create rhythmic pattern
  createRhythmicPattern: function(noteValues, notePitches, startTime = 0, repeats = 1) {
    if (!noteValues || !Array.isArray(noteValues) || 
        !notePitches || !Array.isArray(notePitches)) {
      throw new Error('Invalid rhythm parameters');
    }
    
    const notes = [];
    let time = startTime;
    
    for (let r = 0; r < repeats; r++) {
      for (let i = 0; i < noteValues.length; i++) {
        const pitch = notePitches[i % notePitches.length];
        const duration = noteValues[i];
        
        if (duration > 0) {
          notes.push(new MidiNote(
            pitch,
            time,
            duration,
            80,
            0 // Channel 0 (Piano)
          ));
        }
        
        time += Math.abs(duration); // Advance time for rests too
      }
    }
    
    return notes;
  }
};

// Sequence operations for combining and editing sequences
const SequenceOperations = {
  // Merge two sequences
  mergeSequences: function(sequence1, sequence2) {
    if (!(sequence1 instanceof MidiSequence) || 
        !(sequence2 instanceof MidiSequence)) {
      throw new Error('Invalid sequence objects');
    }
    
    const result = new MidiSequence({
      name: `${sequence1.name} + ${sequence2.name}`,
      tempo: sequence1.tempo,
      timeSignature: sequence1.timeSignature,
      key: sequence1.key
    });
    
    // Add all notes from both sequences
    result.addNotes(sequence1.notes.map(note => note.clone()));
    result.addNotes(sequence2.notes.map(note => note.clone()));
    
    return result;
  },
  
  // Create variation of a sequence
  createVariation: function(sequence, options = {}) {
    if (!(sequence instanceof MidiSequence)) {
      throw new Error('Invalid sequence object');
    }
    
    const {
      noteProbability = 0.8,
      pitchVariation = 0,
      rhythmVariation = 0,
      velocityVariation = 10
    } = options;
    
    const result = new MidiSequence({
      name: `${sequence.name} (Variation)`,
      tempo: sequence.tempo,
      timeSignature: sequence.timeSignature,
      key: sequence.key
    });
    
    // Create variation of notes
    sequence.notes.forEach(originalNote => {
      // Decide whether to include this note
      if (Math.random() < noteProbability) {
        const note = originalNote.clone();
        
        // Apply pitch variation
        if (pitchVariation > 0) {
          const variation = Math.floor(Math.random() * pitchVariation * 2) - pitchVariation;
          note.pitch += variation;
        }
        
        // Apply rhythm variation
        if (rhythmVariation > 0) {
          const startVariation = (Math.random() * rhythmVariation * 2) - rhythmVariation;
          const durationVariation = (Math.random() * rhythmVariation) - (rhythmVariation / 2);
          
          note.startTime += startVariation;
          note.duration = Math.max(0.1, note.duration + durationVariation);
        }
        
        // Apply velocity variation
        if (velocityVariation > 0) {
          const variation = Math.floor(Math.random() * velocityVariation * 2) - velocityVariation;
          note.velocity = Math.min(127, Math.max(1, note.velocity + variation));
        }
        
        result.addNote(note);
      }
    });
    
    return result;
  },
  
  // Split sequence into multiple tracks
  splitByChannel: function(sequence) {
    if (!(sequence instanceof MidiSequence)) {
      throw new Error('Invalid sequence object');
    }
    
    const channels = {};
    
    // Group notes by channel
    sequence.notes.forEach(note => {
      const channel = note.channel;
      
      if (!channels[channel]) {
        channels[channel] = new MidiSequence({
          name: `${sequence.name} (Channel ${channel})`,
          tempo: sequence.tempo,
          timeSignature: sequence.timeSignature,
          key: sequence.key
        });
      }
      
      channels[channel].addNote(note.clone());
    });
    
    return Object.values(channels);
  },
  
  // Create a loop by repeating a sequence
  createLoop: function(sequence, repeats = 4) {
    if (!(sequence instanceof MidiSequence)) {
      throw new Error('Invalid sequence object');
    }
    
    const result = new MidiSequence({
      name: `${sequence.name} (Loop)`,
      tempo: sequence.tempo,
      timeSignature: sequence.timeSignature,
      key: sequence.key
    });
    
    const duration = sequence.getDuration();
    
    // Add repeated notes
    for (let i = 0; i < repeats; i++) {
      sequence.notes.forEach(originalNote => {
        const note = originalNote.clone();
        note.startTime += i * duration;
        result.addNote(note);
      });
    }
    
    return result;
  }
};

// Session management class
class Session {
  constructor(id) {
    this.id = id || `session_${Date.now()}`;
    this.created = new Date();
    this.sequences = {};
    this.currentSequenceId = null;
  }
  
  // Create a new sequence
  createSequence(options = {}) {
    const sequence = new MidiSequence(options);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    return sequence;
  }
  
  // Get a sequence by ID
  getSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    return this.sequences[sequenceId];
  }
  
  // Get the current sequence
  getCurrentSequence() {
    if (!this.currentSequenceId || !this.sequences[this.currentSequenceId]) {
      return null;
    }
    return this.sequences[this.currentSequenceId];
  }
  
  // Set the current sequence
  setCurrentSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    this.currentSequenceId = sequenceId;
    return this.sequences[sequenceId];
  }
  
  // List all sequences
  listSequences() {
    return Object.values(this.sequences).map(seq => ({
      id: seq.id,
      name: seq.name,
      key: seq.key,
      tempo: seq.tempo,
      noteCount: seq.notes.length,
      duration: seq.getDuration()
    }));
  }
  
  // Add notes to current sequence
  addNotes(notes) {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    // Convert notes to MidiNote objects if needed
    const midiNotes = Array.isArray(notes) ? notes.map(note => {
      if (note instanceof MidiNote) return note;
      
      // Handle plain objects
      return new MidiNote(
        note.pitch,
        note.startTime,
        note.duration,
        note.velocity || 80,
        note.channel || 0
      );
    }) : [];
    
    sequence.addNotes(midiNotes);
    return midiNotes;
  }
  
  // Clear notes in current sequence
  clearNotes() {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    const previousNotes = [...sequence.notes];
    sequence.clear();
    return previousNotes;
  }
  
  // Export current sequence
  exportCurrentSequence() {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    return sequence.toJSON();
  }
  
  // Import sequence
  importSequence(json) {
    try {
      const sequence = MidiSequence.fromJSON(json);
      this.sequences[sequence.id] = sequence;
      this.currentSequenceId = sequence.id;
      return sequence;
    } catch (error) {
      throw new Error(`Failed to import sequence: ${error.message}`);
    }
  }
}

// Export all components
module.exports = {
  MusicTheory,
  MidiNote,
  MidiSequence,
  PatternGenerators,
  SequenceOperations,
  Session
};
