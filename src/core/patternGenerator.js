// src/core/patternGenerator.js
class ChordGenerator {
  generatePattern(options = {}) {
    const { root = 60, type = 'major' } = options;
    
    let intervals;
    if (type === 'major') {
      intervals = [0, 4, 7]; // Major chord intervals (root, major 3rd, perfect 5th)
    } else if (type === 'minor') {
      intervals = [0, 3, 7]; // Minor chord intervals (root, minor 3rd, perfect 5th)
    } else if (type === '7th') {
      intervals = [0, 4, 7, 10]; // Dominant 7th chord
    } else if (type === 'maj7') {
      intervals = [0, 4, 7, 11]; // Major 7th chord
    } else if (type === 'min7') {
      intervals = [0, 3, 7, 10]; // Minor 7th chord
    } else {
      intervals = [0, 4, 7]; // Default to major
    }
    
    // Create chord notes
    return intervals.map(interval => ({
      pitch: root + interval,
      startTime: options.startTime || 0,
      duration: options.duration || 1,
      velocity: options.velocity || 80
    }));
  }
  
  generateProgression(options = {}) {
    const { 
      key = 60, // C
      progression = [0, 5, 7, 0], // I-IV-V-I in steps from key
      type = 'major',
      startTime = 0,
      duration = 1,
      velocity = 80
    } = options;
    
    return progression.map((step, index) => {
      return this.generatePattern({
        root: key + step,
        type,
        startTime: startTime + (index * duration),
        duration,
        velocity
      });
    });
  }
}

class BasslineGenerator {
  generatePattern(chordRoots, pattern = 'simple', octave = 3, duration = 0.5) {
    // Transpose chord roots to the bass octave (octave 3 = C3 = MIDI note 48)
    const bassRoots = chordRoots.map(root => {
      // Normalize to C in the requested octave
      const normalizedRoot = (root % 12) + (octave * 12);
      return normalizedRoot;
    });
    
    let bassline = [];
    
    if (pattern === 'simple') {
      // Just play the root notes
      bassRoots.forEach((root, index) => {
        bassline.push({
          pitch: root,
          startTime: index,
          duration: 1,
          velocity: 100
        });
      });
    } else if (pattern === 'walking') {
      // Walking bass pattern (root, fifth, octave, approach)
      bassRoots.forEach((root, index) => {
        bassline.push({
          pitch: root,
          startTime: index * 2,
          duration,
          velocity: 100
        });
        
        bassline.push({
          pitch: root + 7, // fifth
          startTime: index * 2 + duration,
          duration,
          velocity: 90
        });
        
        bassline.push({
          pitch: root + 12, // octave
          startTime: index * 2 + (2 * duration),
          duration,
          velocity: 95
        });
        
        const nextRoot = index < bassRoots.length - 1 ? bassRoots[index + 1] : bassRoots[0];
        const approach = (nextRoot > root) ? nextRoot - 1 : nextRoot + 1;
        
        bassline.push({
          pitch: approach,
          startTime: index * 2 + (3 * duration),
          duration,
          velocity: 85
        });
      });
    } else if (pattern === 'arpeggio') {
      // Arpeggiated pattern
      bassRoots.forEach((root, index) => {
        // Root-Fifth-Octave-Fifth pattern
        const intervals = [0, 7, 12, 7];
        
        intervals.forEach((interval, i) => {
          bassline.push({
            pitch: root + interval,
            startTime: index * 2 + (i * duration),
            duration,
            velocity: 100 - (i * 5)
          });
        });
      });
    }
    
    return bassline;
  }
}

class DrumPatternGenerator {
  constructor() {
    // MIDI note mappings for GM drum kit
    this.drumMap = {
      kick: 36,
      snare: 38,
      hiHat: 42,
      openHiHat: 46,
      rideCymbal: 51,
      crash: 49,
      tom1: 48,
      tom2: 45,
      tom3: 43
    };
  }
  
  generatePattern(style = 'basic', length = 4, velocity = 100) {
    const pattern = {
      kick: [],
      snare: [],
      hiHat: [],
      crash: [],
      tom: []
    };
    
    if (style === 'basic') {
      // 4/4 basic rock beat
      for (let i = 0; i < length; i++) {
        // Kick on beats 1 and 3
        if (i % 4 === 0 || i % 4 === 2) {
          pattern.kick.push({
            pitch: this.drumMap.kick,
            startTime: i * 0.5,
            duration: 0.5,
            velocity
          });
        }
        
        // Snare on beats 2 and 4
        if (i % 4 === 1 || i % 4 === 3) {
          pattern.snare.push({
            pitch: this.drumMap.snare,
            startTime: i * 0.5,
            duration: 0.5,
            velocity
          });
        }
        
        // Hi-hat on every 8th note
        pattern.hiHat.push({
          pitch: this.drumMap.hiHat,
          startTime: i * 0.5,
          duration: 0.5,
          velocity: velocity - 20
        });
      }
    } else if (style === 'fill') {
      // Add more complex drum fill pattern
      
      // Keep basic hihat pattern
      for (let i = 0; i < length; i++) {
        pattern.hiHat.push({
          pitch: this.drumMap.hiHat,
          startTime: i * 0.5,
          duration: 0.5,
          velocity: velocity - 20
        });
      }
      
      // Add snare roll
      for (let i = length - 4; i < length; i++) {
        pattern.snare.push({
          pitch: this.drumMap.snare,
          startTime: i * 0.25,
          duration: 0.25,
          velocity: velocity + 10
        });
      }
      
      // Add tom hits
      pattern.tom.push({
        pitch: this.drumMap.tom1,
        startTime: (length - 1) * 0.5,
        duration: 0.5,
        velocity: velocity + 5
      });
      
      pattern.tom.push({
        pitch: this.drumMap.tom2,
        startTime: (length - 0.5) * 0.5,
        duration: 0.5,
        velocity: velocity + 10
      });
      
      // Crash at the end
      pattern.crash.push({
        pitch: this.drumMap.crash,
        startTime: (length - 0.5) * 0.5,
        duration: 1,
        velocity: velocity + 15
      });
    }
    
    return pattern;
  }
}

module.exports = { 
  ChordGenerator, 
  BasslineGenerator, 
  DrumPatternGenerator 
};
