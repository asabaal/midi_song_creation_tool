/**
 * Chord Progression Generator
 * Core logic for generating, analyzing, and exporting chord progressions
 */

const {
  generateDiatonicChords,
  analyzeChord,
  validateCustomChord,
  noteToMidi,
  midiToNote,
  generateChord,
  normalizeNoteName
} = require('./musicTheory');

const MidiWriter = require('midi-writer-js');

class ChordProgressionGenerator {
  constructor() {
    this.tempo = 120; // Default BPM
    this.timeSignature = [4, 4]; // Default time signature
  }

  /**
   * Generate a structured progression from user input
   * @param {string} key - Key name (e.g. 'C major')
   * @param {Array} chords - Array of chord objects with name, duration, and optional custom notes
   * @param {number} tempo - Beats per minute
   * @returns {Object} Structured progression data
   */
  generateProgression(key, chords, tempo = 120) {
    try {
      this.tempo = tempo;
      
      // Parse key
      const [rootNote, mode] = key.split(' ');
      const actualMode = mode || 'major';
      
      // Get diatonic chords for the key
      const diatonicChords = generateDiatonicChords(key, actualMode);
      
      // Process each chord in the progression
      const processedChords = chords.map((chord, index) => {
        let chordData;
        
        if (chord.custom && chord.notes) {
          // Custom chord with user-defined notes
          const validation = validateCustomChord(chord.notes);
          if (!validation.isValid) {
            throw new Error(`Invalid custom chord at position ${index + 1}: ${validation.errors.join(', ')}`);
          }
          
          chordData = {
            name: chord.name || 'Custom Chord',
            root: validation.analysis.root,
            type: validation.analysis.type,
            notes: chord.notes,
            midiNotes: chord.notes.map(note => typeof note === 'string' ? noteToMidi(note) : note),
            isCustom: true,
            analysis: validation.analysis
          };
        } else {
          // Standard chord from diatonic chords or chord library
          const foundChord = diatonicChords.find(dc => 
            dc.name.toLowerCase().includes(chord.name.toLowerCase())
          ) || this.findChordByName(chord.name, rootNote);
          
          if (!foundChord) {
            throw new Error(`Chord not found: ${chord.name}`);
          }
          
          chordData = {
            ...foundChord,
            isCustom: false
          };
        }
        
        // Calculate timing
        const startTime = chords.slice(0, index).reduce((sum, prevChord) => {
          return sum + this.durationToBeats(prevChord.duration);
        }, 0);
        
        const durationInBeats = this.durationToBeats(chord.duration);
        
        return {
          ...chordData,
          duration: chord.duration,
          durationInBeats,
          startTime,
          position: index
        };
      });
      
      // Calculate total duration
      const totalBeats = processedChords.reduce((sum, chord) => sum + chord.durationInBeats, 0);
      const totalDuration = (totalBeats / this.tempo) * 60; // in seconds
      
      return {
        key,
        tempo: this.tempo,
        timeSignature: this.timeSignature,
        chords: processedChords,
        totalBeats,
        totalDuration,
        diatonicChords
      };
    } catch (error) {
      console.error('Error generating progression:', error);
      throw error;
    }
  }

  /**
   * Convert duration notation to beats
   * @param {string} duration - Duration notation (e.g. '1', '1/2', '2', '4')
   * @returns {number} Duration in beats
   */
  durationToBeats(duration) {
    if (typeof duration === 'number') {
      return duration;
    }
    
    if (duration.includes('/')) {
      const [numerator, denominator] = duration.split('/').map(Number);
      return numerator / denominator;
    }
    
    const beatValue = parseFloat(duration);
    if (!isNaN(beatValue)) {
      return beatValue;
    }
    
    // Default to 1 beat if parsing fails
    return 1;
  }

  /**
   * Find a chord by name (fallback for non-diatonic chords)
   * @param {string} chordName - Name of the chord
   * @param {string} rootNote - Root note for context
   * @returns {Object|null} Chord data or null if not found
   */
  findChordByName(chordName, rootNote) {
    try {
      // Parse chord name (e.g. "C major", "F# minor7")
      const parts = chordName.trim().split(' ');
      if (parts.length < 2) return null;
      
      const chordRoot = normalizeNoteName(parts[0]);
      const chordType = parts.slice(1).join(' ').toLowerCase();
      
      // Map common chord type names
      const typeMap = {
        'major': 'major',
        'maj': 'major',
        'minor': 'minor',
        'min': 'minor',
        'm': 'minor',
        '7': 'dominant7',
        'dominant7': 'dominant7',
        'major7': 'major7',
        'maj7': 'major7',
        'minor7': 'minor7',
        'min7': 'minor7',
        'm7': 'minor7',
        'dim': 'diminished',
        'diminished': 'diminished',
        'aug': 'augmented',
        'augmented': 'augmented',
        'sus2': 'sus2',
        'sus4': 'sus4'
      };
      
      const normalizedType = typeMap[chordType] || chordType;
      
      // Generate the chord
      const midiNotes = generateChord(chordRoot, normalizedType, 4);
      
      return {
        name: chordName,
        root: chordRoot,
        type: normalizedType,
        notes: midiNotes.map(midiToNote),
        midiNotes,
        function: null, // Non-diatonic chords don't have Roman numeral functions
        scaleDegree: null
      };
    } catch (error) {
      console.error(`Error finding chord by name "${chordName}":`, error);
      return null;
    }
  }

  /**
   * Export progression to MIDI format
   * @param {Object} progression - Progression data from generateProgression
   * @returns {Object} MIDI file data
   */
  exportToMIDI(progression) {
    try {
      const track = new MidiWriter.Track();
      
      // Set tempo and time signature
      track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 })); // Acoustic Grand Piano
      track.setTempo(progression.tempo);
      track.setTimeSignature(progression.timeSignature[0], progression.timeSignature[1]);
      
      // Add each chord to the track
      progression.chords.forEach(chord => {
        const duration = this.beatsToMIDIDuration(chord.durationInBeats);
        
        // Add all notes of the chord simultaneously
        chord.midiNotes.forEach(midiNote => {
          track.addEvent(new MidiWriter.NoteEvent({
            pitch: [midiNote],
            duration: duration,
            velocity: 80, // Medium velocity
            startTick: this.beatsToTicks(chord.startTime, progression.tempo)
          }));
        });
      });
      
      // Generate MIDI file
      const write = new MidiWriter.Writer(track);
      
      return {
        midiData: write.buildFile(),
        base64: write.dataUri(),
        filename: `chord-progression-${progression.key.replace(' ', '-')}.mid`
      };
    } catch (error) {
      console.error('Error exporting to MIDI:', error);
      throw error;
    }
  }

  /**
   * Convert beats to MIDI ticks
   * @param {number} beats - Number of beats
   * @param {number} tempo - Tempo in BPM
   * @returns {number} MIDI ticks
   */
  beatsToTicks(beats, tempo) {
    // MIDI has 480 ticks per quarter note by default
    const ticksPerQuarterNote = 480;
    return Math.round(beats * ticksPerQuarterNote);
  }

  /**
   * Convert beats to MIDI duration format
   * @param {number} beats - Number of beats
   * @returns {string} MIDI duration notation
   */
  beatsToMIDIDuration(beats) {
    // Map common beat values to MIDI duration notation
    if (beats === 4) return '1'; // Whole note
    if (beats === 2) return '2'; // Half note
    if (beats === 1) return '4'; // Quarter note
    if (beats === 0.5) return '8'; // Eighth note
    if (beats === 0.25) return '16'; // Sixteenth note
    
    // For other values, use the closest match
    if (beats > 2) return '1';
    if (beats > 1) return '2';
    if (beats > 0.5) return '4';
    if (beats > 0.25) return '8';
    return '16';
  }

  /**
   * Analyze progression and provide suggestions
   * @param {Object} progression - Progression data
   * @returns {Object} Analysis with suggestions
   */
  analyzeProgression(progression) {
    try {
      const suggestions = [];
      const chordFunctions = progression.chords.map(chord => chord.function).filter(Boolean);
      
      // Check for common progression patterns
      const progressionPattern = chordFunctions.join('-');
      
      // Common progressions and their names
      const commonProgressions = {
        'I-IV-V-I': 'Classic cadence',
        'I-V-vi-IV': 'Pop progression',
        'I-vi-IV-V': '50s progression',
        'ii-V-I': 'Jazz turnaround',
        'I-IV-viio-V': 'Classical progression'
      };
      
      if (commonProgressions[progressionPattern]) {
        suggestions.push(`This follows the "${commonProgressions[progressionPattern]}" pattern`);
      }
      
      // Check for voice leading issues
      for (let i = 1; i < progression.chords.length; i++) {
        const prevChord = progression.chords[i - 1];
        const currChord = progression.chords[i];
        
        // Check for parallel fifths (simplified check)
        if (prevChord.midiNotes.length >= 2 && currChord.midiNotes.length >= 2) {
          const prevIntervals = this.getIntervals(prevChord.midiNotes);
          const currIntervals = this.getIntervals(currChord.midiNotes);
          
          // This is a simplified check - real voice leading analysis is more complex
          const hasParallelFifth = prevIntervals.some(interval => 
            interval === 7 && currIntervals.includes(7)
          );
          
          if (hasParallelFifth) {
            suggestions.push(`Consider voice leading between chords ${i} and ${i + 1}`);
          }
        }
      }
      
      // Check for variety
      const uniqueChords = new Set(progression.chords.map(chord => chord.name));
      if (uniqueChords.size < progression.chords.length * 0.5) {
        suggestions.push('Consider adding more chord variety for interest');
      }
      
      return {
        suggestions,
        pattern: progressionPattern,
        uniqueChords: uniqueChords.size,
        totalChords: progression.chords.length,
        harmonicRhythm: this.analyzeHarmonicRhythm(progression.chords)
      };
    } catch (error) {
      console.error('Error analyzing progression:', error);
      return { suggestions: ['Error analyzing progression'], error: error.message };
    }
  }

  /**
   * Get intervals between notes in a chord
   * @param {Array} midiNotes - Array of MIDI note numbers
   * @returns {Array} Array of intervals in semitones
   */
  getIntervals(midiNotes) {
    const sorted = [...midiNotes].sort((a, b) => a - b);
    const intervals = [];
    
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i] - sorted[0]);
    }
    
    return intervals;
  }

  /**
   * Analyze harmonic rhythm (pattern of chord changes)
   * @param {Array} chords - Array of chord objects
   * @returns {Object} Harmonic rhythm analysis
   */
  analyzeHarmonicRhythm(chords) {
    const durations = chords.map(chord => chord.durationInBeats);
    const uniqueDurations = [...new Set(durations)];
    
    return {
      durations,
      uniqueDurations,
      isConsistent: uniqueDurations.length === 1,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length
    };
  }
}

module.exports = ChordProgressionGenerator;