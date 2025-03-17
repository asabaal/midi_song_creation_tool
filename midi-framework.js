// MIDI Song Creation Tool Framework
// This implements the core functionality for MIDI creation, manipulation, and analysis

// ========================
// CORE MUSIC THEORY MODULE
// ========================

const MusicTheory = {
  // MIDI note numbers for reference
  NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  
  // Note to MIDI number mapping (middle C = C4 = 60)
  getNoteNumber: function(noteName, octave = 4) {
    const noteIndex = this.NOTE_NAMES.indexOf(noteName);
    if (noteIndex === -1) return null;
    return noteIndex + (octave * 12);
  },
  
  // MIDI number to note name conversion
  getNoteName: function(midiNumber) {
    const noteName = this.NOTE_NAMES[midiNumber % 12];
    const octave = Math.floor(midiNumber / 12) - 1;
    return `${noteName}${octave}`;
  },
  
  // Scale definitions (patterns of half and whole steps)
  SCALES: {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonicMajor: [0, 2, 4, 7, 9],
    pentatonicMinor: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  
  // Generate scale notes for a specific key
  generateScale: function(rootNote, rootOctave, scaleType = 'major') {
    if (!this.SCALES[scaleType]) {
      throw new Error(`Scale type '${scaleType}' not recognized`);
    }
    
    const rootMidiNumber = this.getNoteNumber(rootNote, rootOctave);
    if (rootMidiNumber === null) {
      throw new Error(`Root note '${rootNote}' not recognized`);
    }
    
    return this.SCALES[scaleType].map(interval => rootMidiNumber + interval);
  },
  
  // Chord definitions (intervals from root)
  CHORDS: {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    dominant7: [0, 4, 7, 10],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    diminished7: [0, 3, 6, 9],
    halfDiminished7: [0, 3, 6, 10],
    augmented7: [0, 4, 8, 10],
    minorMajor7: [0, 3, 7, 11]
  },
  
  // Generate chord notes for a specific root
  generateChord: function(rootNote, rootOctave, chordType = 'major') {
    if (!this.CHORDS[chordType]) {
      throw new Error(`Chord type '${chordType}' not recognized`);
    }
    
    const rootMidiNumber = this.getNoteNumber(rootNote, rootOctave);
    if (rootMidiNumber === null) {
      throw new Error(`Root note '${rootNote}' not recognized`);
    }
    
    return this.CHORDS[chordType].map(interval => rootMidiNumber + interval);
  },
  
  // Common chord progressions by scale degree
  PROGRESSIONS: {
    '1-4-5': [1, 4, 5, 1],
    '1-5-6-4': [1, 5, 6, 4],
    '1-6-4-5': [1, 6, 4, 5],
    '1-4-6-5': [1, 4, 6, 5],
    '2-5-1': [2, 5, 1],
    'canon': [1, 5, 6, 3, 4, 1, 4, 5]
  },
  
  // Generate chord progression based on key and pattern
  generateProgression: function(key, octave, progressionName, scaleType = 'major') {
    if (!this.PROGRESSIONS[progressionName]) {
      throw new Error(`Progression '${progressionName}' not recognized`);
    }
    
    // Generate scale for the key
    const scale = this.generateScale(key, octave, scaleType);
    
    // Map scale degrees to actual scale notes
    return this.PROGRESSIONS[progressionName].map(scaleDegree => {
      // Adjust for 1-based indexing and handle wrapping
      const index = (scaleDegree - 1) % scale.length;
      const rootMidiNumber = scale[index];
      
      // For minor scale, use minor chords for scale degrees 1, 4, 5
      let chordType = scaleType === 'minor' ? 'minor' : 'major';
      
      // For major scale, use minor chords for scale degrees 2, 3, 6
      if (scaleType === 'major' && [2, 3, 6].includes(scaleDegree)) {
        chordType = 'minor';
      }
      
      // Create diminished chord for scale degree 7 in major scale
      if (scaleType === 'major' && scaleDegree === 7) {
        chordType = 'diminished';
      }
      
      // Extract root note name and octave
      const noteName = this.NOTE_NAMES[rootMidiNumber % 12];
      const noteOctave = Math.floor(rootMidiNumber / 12) - 1;
      
      return {
        root: noteName,
        octave: noteOctave,
        chordType: chordType,
        notes: this.generateChord(noteName, noteOctave, chordType)
      };
    });
  }
};

// ================
// MIDI NOTE MODULE
// ================

class MidiNote {
  constructor(pitch, startTime, duration, velocity = 80, channel = 0) {
    this.pitch = pitch;
    this.startTime = startTime;
    this.duration = duration;
    this.velocity = velocity;
    this.channel = channel;
  }
  
  // Clone a note
  clone() {
    return new MidiNote(
      this.pitch,
      this.startTime,
      this.duration,
      this.velocity,
      this.channel
    );
  }
  
  // Transpose note by semitones
  transpose(semitones) {
    const newNote = this.clone();
    newNote.pitch = Math.min(127, Math.max(0, this.pitch + semitones));
    return newNote;
  }
  
  // Change note duration
  setDuration(newDuration) {
    const newNote = this.clone();
    newNote.duration = Math.max(0, newDuration);
    return newNote;
  }
  
  // Change note velocity
  setVelocity(newVelocity) {
    const newNote = this.clone();
    newNote.velocity = Math.min(127, Math.max(0, newVelocity));
    return newNote;
  }
  
  // Get note end time
  getEndTime() {
    return this.startTime + this.duration;
  }
  
  // Convert to simple object for serialization
  toJSON() {
    return {
      pitch: this.pitch,
      startTime: this.startTime,
      duration: this.duration,
      velocity: this.velocity,
      channel: this.channel
    };
  }
  
  // Create note from JSON
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

// ====================
// MIDI SEQUENCE MODULE
// ====================

class MidiSequence {
  constructor(options = {}) {
    this.notes = [];
    this.timeSignature = options.timeSignature || { numerator: 4, denominator: 4 };
    this.tempo = options.tempo || 120;
    this.key = options.key || 'C major';
    this.name = options.name || 'Untitled Sequence';
    this.id = options.id || this._generateId();
  }
  
  // Generate unique ID
  _generateId() {
    return 'seq_' + Math.random().toString(36).substr(2, 9);
  }
  
  // Add a note to the sequence
  addNote(note) {
    this.notes.push(note instanceof MidiNote ? note : MidiNote.fromJSON(note));
    return this;
  }
  
  // Add multiple notes
  addNotes(notes) {
    notes.forEach(note => this.addNote(note));
    return this;
  }
  
  // Remove note at index
  removeNote(index) {
    if (index >= 0 && index < this.notes.length) {
      this.notes.splice(index, 1);
    }
    return this;
  }
  
  // Get notes in time range
  getNotesInRange(startTime, endTime) {
    return this.notes.filter(note => 
      note.startTime < endTime && note.getEndTime() > startTime
    );
  }
  
  // Clear all notes
  clear() {
    this.notes = [];
    return this;
  }
  
  // Get sequence duration
  getDuration() {
    if (this.notes.length === 0) return 0;
    return Math.max(...this.notes.map(note => note.getEndTime()));
  }
  
  // Transpose entire sequence
  transpose(semitones) {
    const newSequence = this.clone();
    newSequence.notes = this.notes.map(note => note.transpose(semitones));
    return newSequence;
  }
  
  // Clone sequence
  clone() {
    const newSequence = new MidiSequence({
      timeSignature: { ...this.timeSignature },
      tempo: this.tempo,
      key: this.key,
      name: this.name
    });
    
    newSequence.notes = this.notes.map(note => note.clone());
    return newSequence;
  }
  
  // Convert to simple object for serialization
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
  
  // Create sequence from JSON
  static fromJSON(json) {
    const sequence = new MidiSequence({
      id: json.id,
      name: json.name,
      timeSignature: json.timeSignature,
      tempo: json.tempo,
      key: json.key
    });
    
    sequence.notes = json.notes.map(note => MidiNote.fromJSON(note));
    return sequence;
  }
}

// ==================
// PATTERN GENERATORS
// ==================

const PatternGenerators = {
  // Generate a repeating rhythmic pattern
  createRhythmicPattern: function(noteValues, notePitches, startTime = 0, repeats = 1) {
    const notes = [];
    let currentTime = startTime;
    
    for (let i = 0; i < repeats; i++) {
      for (let j = 0; j < noteValues.length; j++) {
        const duration = noteValues[j];
        // Skip if this is a rest (duration < 0)
        if (duration > 0) {
          // Handle arrays of pitches (chords)
          const pitches = Array.isArray(notePitches[j % notePitches.length]) 
            ? notePitches[j % notePitches.length] 
            : [notePitches[j % notePitches.length]];
            
          pitches.forEach(pitch => {
            notes.push(new MidiNote(
              pitch,
              currentTime,
              duration
            ));
          });
        }
        currentTime += Math.abs(duration);
      }
    }
    
    return notes;
  },
  
  // Create a basic drum pattern (kick, snare, hi-hat)
  createDrumPattern: function(patternType = 'basic', measures = 1) {
    // MIDI drum note numbers
    const DRUMS = {
      KICK: 36,
      SNARE: 38,
      CLOSED_HH: 42,
      OPEN_HH: 46
    };
    
    const notes = [];
    const beatsPerMeasure = 4; // Assuming 4/4 time
    const sixteenthsPerBeat = 4; // 16th notes per beat
    const sixteenthNoteDuration = 0.25; // Duration of a 16th note in beats
    
    // Define different pattern types
    const patterns = {
      basic: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
      },
      rock: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
      },
      funk: {
        kick: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      }
    };
    
    // Use requested pattern or default to basic
    const pattern = patterns[patternType] || patterns.basic;
    
    // Create drum notes for the pattern
    for (let measure = 0; measure < measures; measure++) {
      const measureOffset = measure * beatsPerMeasure;
      
      for (let i = 0; i < beatsPerMeasure * sixteenthsPerBeat; i++) {
        const time = measureOffset + (i * sixteenthNoteDuration);
        
        // Add kick drum notes
        if (pattern.kick[i % pattern.kick.length]) {
          notes.push(new MidiNote(DRUMS.KICK, time, sixteenthNoteDuration, 100, 9));
        }
        
        // Add snare drum notes
        if (pattern.snare[i % pattern.snare.length]) {
          notes.push(new MidiNote(DRUMS.SNARE, time, sixteenthNoteDuration, 90, 9));
        }
        
        // Add hi-hat notes
        if (pattern.hihat[i % pattern.hihat.length]) {
          notes.push(new MidiNote(DRUMS.CLOSED_HH, time, sixteenthNoteDuration, 80, 9));
        }
      }
    }
    
    return notes;
  },
  
  // Create an arpeggio pattern from chord notes
  createArpeggio: function(chordNotes, octaveRange = 1, pattern = 'up', noteDuration = 0.25, startTime = 0, repeats = 1) {
    const notes = [];
    let currentTime = startTime;
    
    // Expand chord notes across octave range
    let allNotes = [];
    for (let octave = 0; octave < octaveRange; octave++) {
      chordNotes.forEach(note => {
        allNotes.push(note + (octave * 12));
      });
    }
    
    // Create different pattern types
    let patternNotes;
    switch (pattern) {
      case 'up':
        patternNotes = [...allNotes].sort((a, b) => a - b);
        break;
      case 'down':
        patternNotes = [...allNotes].sort((a, b) => b - a);
        break;
      case 'updown':
        patternNotes = [
          ...allNotes.sort((a, b) => a - b),
          ...allNotes.sort((a, b) => b - a).slice(1, -1)
        ];
        break;
      case 'random':
        patternNotes = [...allNotes];
        // Fisher-Yates shuffle
        for (let i = patternNotes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [patternNotes[i], patternNotes[j]] = [patternNotes[j], patternNotes[i]];
        }
        break;
      default:
        patternNotes = [...allNotes].sort((a, b) => a - b);
    }
    
    // Create arpeggio notes
    for (let i = 0; i < repeats; i++) {
      patternNotes.forEach(pitch => {
        notes.push(new MidiNote(
          pitch,
          currentTime,
          noteDuration
        ));
        currentTime += noteDuration;
      });
    }
    
    return notes;
  },
  
  // Create a chord progression with a specific rhythm
  createChordProgression: function(progression, rhythmPattern = [1], startTime = 0) {
    const notes = [];
    let currentTime = startTime;
    
    progression.forEach((chord, i) => {
      const rhythmValue = rhythmPattern[i % rhythmPattern.length];
      
      // Add each note in the chord
      chord.notes.forEach(pitch => {
        notes.push(new MidiNote(
          pitch,
          currentTime,
          rhythmValue
        ));
      });
      
      currentTime += rhythmValue;
    });
    
    return notes;
  },
  
  // Create a bassline from chord progression
  createBassline: function(progression, rhythmPattern = [1, 0.5, 0.5], startTime = 0) {
    const notes = [];
    let currentTime = startTime;
    
    progression.forEach(chord => {
      // Get the root note of the chord for the bass
      const rootNote = chord.notes[0];
      
      // Apply rhythm pattern to the root note
      rhythmPattern.forEach(duration => {
        if (duration > 0) { // Skip rests (duration <= 0)
          notes.push(new MidiNote(
            rootNote - 12, // Go down an octave for bass
            currentTime,
            duration,
            90, // Slightly higher velocity for bass
            1 // Use channel 1 for bass
          ));
        }
        currentTime += Math.abs(duration);
      });
    });
    
    return notes;
  }
};

// ====================
// SEQUENCE OPERATIONS
// ====================

const SequenceOperations = {
  // Merge multiple sequences into one
  mergeSequences: function(sequences) {
    if (!sequences || sequences.length === 0) {
      return new MidiSequence();
    }
    
    // Create a new sequence with properties from the first sequence
    const merged = sequences[0].clone();
    merged.clear(); // Clear notes from the clone
    
    // Merge all notes from all sequences
    sequences.forEach(seq => {
      merged.addNotes(seq.notes);
    });
    
    return merged;
  },
  
  // Quantize timing of notes to a grid
  quantizeSequence: function(sequence, gridSize = 0.25) {
    const newSequence = sequence.clone();
    
    newSequence.notes.forEach(note => {
      // Quantize start time
      note.startTime = Math.round(note.startTime / gridSize) * gridSize;
      
      // Quantize duration
      note.duration = Math.max(gridSize, Math.round(note.duration / gridSize) * gridSize);
    });
    
    return newSequence;
  },
  
  // Create a variation of a sequence with specified modifications
  createVariation: function(sequence, options = {}) {
    const newSequence = sequence.clone();
    
    // Apply transposition if specified
    if (options.transpose) {
      newSequence.notes = newSequence.notes.map(note => 
        note.transpose(options.transpose)
      );
    }
    
    // Apply velocity changes if specified
    if (options.velocityChange) {
      newSequence.notes = newSequence.notes.map(note => {
        const newVel = note.velocity + options.velocityChange;
        return note.setVelocity(newVel);
      });
    }
    
    // Apply timing variations if specified
    if (options.timingVariation) {
      newSequence.notes = newSequence.notes.map(note => {
        const variation = (Math.random() * 2 - 1) * options.timingVariation;
        const newNote = note.clone();
        newNote.startTime = Math.max(0, note.startTime + variation);
        return newNote;
      });
    }
    
    // Apply note addition/removal if specified
    if (options.noteAdditionRate) {
      // Add random notes
      const duration = sequence.getDuration();
      const newNotesCount = Math.floor(sequence.notes.length * options.noteAdditionRate);
      
      for (let i = 0; i < newNotesCount; i++) {
        // Choose a random pitch similar to existing notes
        const randomIndex = Math.floor(Math.random() * sequence.notes.length);
        const referencePitch = sequence.notes[randomIndex].pitch;
        const randomPitch = referencePitch + Math.floor(Math.random() * 7) - 3; // ±3 semitones
        
        // Add at a random time
        const startTime = Math.random() * duration;
        newSequence.addNote(new MidiNote(
          randomPitch,
          startTime,
          0.25, // Quarter note duration
          70 + Math.floor(Math.random() * 30) // Random velocity between 70-100
        ));
      }
    }
    
    if (options.noteRemovalRate) {
      // Remove random notes
      const notesToRemove = Math.floor(sequence.notes.length * options.noteRemovalRate);
      for (let i = 0; i < notesToRemove; i++) {
        const indexToRemove = Math.floor(Math.random() * newSequence.notes.length);
        newSequence.notes.splice(indexToRemove, 1);
      }
    }
    
    return newSequence;
  },
  
  // Change the rhythm of a sequence while preserving pitches
  changeRhythm: function(sequence, newRhythmPattern) {
    const newSequence = new MidiSequence({
      timeSignature: sequence.timeSignature,
      tempo: sequence.tempo,
      key: sequence.key,
      name: sequence.name + " (Rhythm Variation)"
    });
    
    // Extract pitches from original sequence
    const pitches = sequence.notes.map(note => note.pitch);
    
    // Apply new rhythm pattern to pitches
    let currentTime = 0;
    let pitchIndex = 0;
    
    for (const duration of newRhythmPattern) {
      if (duration > 0) { // Skip rests
        const pitch = pitches[pitchIndex % pitches.length];
        newSequence.addNote(new MidiNote(
          pitch,
          currentTime,
          duration,
          80
        ));
        pitchIndex++;
      }
      currentTime += Math.abs(duration);
    }
    
    return newSequence;
  }
};

// ==============
// SESSION MODULE
// ==============

class Session {
  constructor(id) {
    this.id = id || 'session_' + Math.random().toString(36).substr(2, 9);
    this.created = new Date();
    this.sequences = {};
    this.currentSequenceId = null;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
  }
  
  // Create a new sequence
  createSequence(options = {}) {
    const sequence = new MidiSequence(options);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    
    this._addToHistory({
      action: 'createSequence',
      sequenceId: sequence.id
    });
    
    return sequence;
  }
  
  // Get current sequence
  getCurrentSequence() {
    if (!this.currentSequenceId || !this.sequences[this.currentSequenceId]) {
      return null;
    }
    return this.sequences[this.currentSequenceId];
  }
  
  // Set current sequence
  setCurrentSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    this.currentSequenceId = sequenceId;
    return this.sequences[sequenceId];
  }
  
  // Get sequence by ID
  getSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
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
  
  // Delete a sequence
  deleteSequence(sequenceId) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    
    const deletedSequence = this.sequences[sequenceId];
    delete this.sequences[sequenceId];
    
    // If we deleted the current sequence, set current to null
    if (this.currentSequenceId === sequenceId) {
      const remainingSequences = Object.keys(this.sequences);
      this.currentSequenceId = remainingSequences.length > 0 
        ? remainingSequences[0] 
        : null;
    }
    
    this._addToHistory({
      action: 'deleteSequence',
      sequenceId: sequenceId,
      sequence: deletedSequence.toJSON()
    });
    
    return true;
  }
  
  // Update sequence properties (not notes)
  updateSequence(sequenceId, properties) {
    if (!this.sequences[sequenceId]) {
      throw new Error(`Sequence with ID ${sequenceId} not found`);
    }
    
    const previousState = this.sequences[sequenceId].toJSON();
    const sequence = this.sequences[sequenceId];
    
    // Update valid properties
    ['name', 'tempo', 'key', 'timeSignature'].forEach(prop => {
      if (properties[prop] !== undefined) {
        sequence[prop] = properties[prop];
      }
    });
    
    this._addToHistory({
      action: 'updateSequence',
      sequenceId: sequenceId,
      previousState: previousState
    });
    
    return sequence;
  }
  
  // Add note to current sequence
  addNote(note) {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    sequence.addNote(note);
    
    this._addToHistory({
      action: 'addNote',
      sequenceId: sequence.id,
      note: note
    });
    
    return note;
  }
  
  // Add multiple notes to current sequence
  addNotes(notes) {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    sequence.addNotes(notes);
    
    this._addToHistory({
      action: 'addNotes',
      sequenceId: sequence.id,
      notes: notes.map(n => n instanceof MidiNote ? n.toJSON() : n)
    });
    
    return notes;
  }
  
  // Clear notes from current sequence
  clearNotes() {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    const previousNotes = sequence.notes.map(note => note.toJSON());
    sequence.clear();
    
    this._addToHistory({
      action: 'clearNotes',
      sequenceId: sequence.id,
      previousNotes: previousNotes
    });
    
    return true;
  }
  
  // Export current sequence as JSON
  exportCurrentSequence() {
    const sequence = this.getCurrentSequence();
    if (!sequence) {
      throw new Error('No current sequence selected');
    }
    
    return sequence.toJSON();
  }
  
  // Import sequence from JSON
  importSequence(json) {
    const sequence = MidiSequence.fromJSON(json);
    this.sequences[sequence.id] = sequence;
    this.currentSequenceId = sequence.id;
    
    this._addToHistory({
      action: 'importSequence',
      sequenceId: sequence.id
    });
    
    return sequence;
  }
  
  // Add operation to history
  _addToHistory(operation) {
    // If we're in the middle of the history stack, truncate forward history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Add timestamp to operation
    operation.timestamp = new Date();
    
    // Add to history
    this.history.push(operation);
    this.historyIndex = this.history.length - 1;
    
    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  // Undo last operation
  undo() {
    if (this.historyIndex < 0) {
      return false; // Nothing to undo
    }
    
    const operation = this.history[this.historyIndex];
    this.historyIndex--;
    
    // Handle different operation types
    switch (operation.action) {
      case 'createSequence':
        delete this.sequences[operation.sequenceId];
        // Set current sequence to previous one or null
        this.currentSequenceId = this.historyIndex >= 0 
          ? this.history[this.historyIndex].sequenceId 
          : null;
        break;
        
      case 'deleteSequence':
        this.sequences[operation.sequenceId] = MidiSequence.fromJSON(operation.sequence);
        break;
        
      case 'updateSequence':
        this.sequences[operation.sequenceId] = MidiSequence.fromJSON(operation.previousState);
        break;
        
      case 'addNote':
        const addNoteSeq = this.sequences[operation.sequenceId];
        // Remove last note
        addNoteSeq.notes.pop();
        break;
        
      case 'addNotes':
        const addNotesSeq = this.sequences[operation.sequenceId];
        // Remove last n notes
        addNotesSeq.notes.splice(addNotesSeq.notes.length - operation.notes.length);
        break;
        
      case 'clearNotes':
        const clearNotesSeq = this.sequences[operation.sequenceId];
        // Restore previous notes
        clearNotesSeq.notes = operation.previousNotes.map(n => MidiNote.fromJSON(n));
        break;
        
      case 'importSequence':
        delete this.sequences[operation.sequenceId];
        break;
        
      default:
        return false;
    }
    
    return true;
  }
  
  // Redo last undone operation
  redo() {
    if (this.historyIndex >= this.history.length - 1) {
      return false; // Nothing to redo
    }
    
    this.historyIndex++;
    const operation = this.history[this.historyIndex];
    
    // Handle different operation types
    switch (operation.action) {
      case 'createSequence':
        // Need to recreate the sequence
        this.currentSequenceId = operation.sequenceId;
        if (!this.sequences[operation.sequenceId]) {
          this.sequences[operation.sequenceId] = new MidiSequence({ id: operation.sequenceId });
        }
        break;
        
      case 'deleteSequence':
        delete this.sequences[operation.sequenceId];
        break;
        
      case 'updateSequence':
        // Need more information to properly redo this
        break;
        
      case 'addNote':
        const addNoteSeq = this.sequences[operation.sequenceId];
        addNoteSeq.addNote(operation.note);
        break;
        
      case 'addNotes':
        const addNotesSeq = this.sequences[operation.sequenceId];
        addNotesSeq.addNotes(operation.notes.map(n => MidiNote.fromJSON(n)));
        break;
        
      case 'clearNotes':
        const clearNotesSeq = this.sequences[operation.sequenceId];
        clearNotesSeq.clear();
        break;
        
      case 'importSequence':
        // Need to have the original JSON to redo this properly
        break;
        
      default:
        return false;
    }
    
    return true;
  }
  
  // Export session state
  toJSON() {
    return {
      id: this.id,
      created: this.created,
      currentSequenceId: this.currentSequenceId,
      sequences: Object.values(this.sequences).map(seq => seq.toJSON())
    };
  }
  
  // Create session from JSON
  static fromJSON(json) {
    const session = new Session(json.id);
    session.created = new Date(json.created);
    
    // Import all sequences
    json.sequences.forEach(seqJson => {
      const sequence = MidiSequence.fromJSON(seqJson);
      session.sequences[sequence.id] = sequence;
    });
    
    session.currentSequenceId = json.currentSequenceId;
    return session;
  }
}

// ==================
// MIDI EXPORT MODULE
// ==================

const MidiExporter = {
  // Convert sequence to MIDI file data
  // This is a simplified version - a full implementation would use a library like jsmidgen
  sequenceToMidiData: function(sequence) {
    // This would normally generate a real MIDI file
    // For now, we'll just return a serialized version of the sequence
    return JSON.stringify(sequence.toJSON());
  },
  
  // Convert MIDI file data to sequence
  // This is a simplified version - a full implementation would use a library like jsmidigen
  midiDataToSequence: function(midiData) {
    try {
      // This would normally parse a real MIDI file
      // For now, we'll just parse the JSON we created
      return MidiSequence.fromJSON(JSON.parse(midiData));
    } catch (e) {
      throw new Error('Invalid MIDI data format');
    }
  }
};

// Export all modules for API use
module.exports = {
  MusicTheory,
  MidiNote,
  MidiSequence,
  PatternGenerators,
  SequenceOperations,
  Session,
  MidiExporter
};