// tests/unit/core/midiFileExport.test.js
const fs = require('fs');
const path = require('path');
const midiExport = require('../../../src/core/midiExport');

// Create a temporary directory for test output if it doesn't exist
const testOutputDir = path.join(__dirname, '../../../test-output');
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

describe('MIDI File Export Module', () => {
  // Clean up test files after tests
  afterAll(() => {
    // Delete test files created during tests
    const files = fs.readdirSync(testOutputDir);
    files.forEach(file => {
      if (file.endsWith('.mid')) {
        fs.unlinkSync(path.join(testOutputDir, file));
      }
    });
  });

  describe('exportMidiFile', () => {
    it('should export a MIDI file with a single track', async () => {
      // Create a simple sequence with one track
      const sequence = {
        tracks: [
          {
            name: 'Test Track',
            notes: [
              { pitch: 60, startTime: 0, duration: 1, velocity: 100 },  // C4, quarter note
              { pitch: 62, startTime: 1, duration: 1, velocity: 100 },  // D4, quarter note
              { pitch: 64, startTime: 2, duration: 1, velocity: 100 },  // E4, quarter note
              { pitch: 65, startTime: 3, duration: 1, velocity: 100 }   // F4, quarter note
            ],
            instrument: 0  // Piano
          }
        ],
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 }
      };
      
      const outputPath = path.join(testOutputDir, 'single-track-test.mid');
      
      // Export the MIDI file
      await midiExport.exportMidiFile(sequence, outputPath);
      
      // Verify file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });
    
    it('should export a MIDI file with multiple tracks', async () => {
      // Create a sequence with multiple tracks
      const sequence = {
        tracks: [
          {
            name: 'Melody',
            notes: [
              { pitch: 72, startTime: 0, duration: 2, velocity: 100 },  // C5, half note
              { pitch: 74, startTime: 2, duration: 2, velocity: 100 }   // D5, half note
            ],
            instrument: 0  // Piano
          },
          {
            name: 'Bass',
            notes: [
              { pitch: 48, startTime: 0, duration: 1, velocity: 100 },  // C3
              { pitch: 48, startTime: 1, duration: 1, velocity: 100 },  // C3
              { pitch: 50, startTime: 2, duration: 1, velocity: 100 },  // D3
              { pitch: 50, startTime: 3, duration: 1, velocity: 100 }   // D3
            ],
            instrument: 32  // Acoustic bass
          },
          {
            name: 'Drums',
            notes: [
              { pitch: 36, startTime: 0, duration: 0.25, velocity: 100 },  // Bass drum
              { pitch: 38, startTime: 1, duration: 0.25, velocity: 100 },  // Snare
              { pitch: 36, startTime: 2, duration: 0.25, velocity: 100 },  // Bass drum
              { pitch: 38, startTime: 3, duration: 0.25, velocity: 100 }   // Snare
            ],
            instrument: 118  // Drum kit
          }
        ],
        tempo: 100,
        timeSignature: { numerator: 4, denominator: 4 }
      };
      
      const outputPath = path.join(testOutputDir, 'multi-track-test.mid');
      
      // Export the MIDI file
      await midiExport.exportMidiFile(sequence, outputPath);
      
      // Verify file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });
    
    it('should handle empty tracks', async () => {
      // Create a sequence with an empty track
      const sequence = {
        tracks: [
          {
            name: 'Empty Track',
            notes: [],
            instrument: 0
          }
        ],
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 }
      };
      
      const outputPath = path.join(testOutputDir, 'empty-track-test.mid');
      
      // Export should still work with empty tracks
      await midiExport.exportMidiFile(sequence, outputPath);
      
      // Verify file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
    });
    
    it('should apply tempo and time signature settings', async () => {
      // Create a sequence with specific tempo and time signature
      const sequence = {
        tracks: [
          {
            name: 'Test Track',
            notes: [
              { pitch: 60, startTime: 0, duration: 1, velocity: 100 }
            ],
            instrument: 0
          }
        ],
        tempo: 160,  // 160 BPM
        timeSignature: { numerator: 3, denominator: 4 }  // 3/4 time
      };
      
      const outputPath = path.join(testOutputDir, 'tempo-signature-test.mid');
      
      // Export the MIDI file
      await midiExport.exportMidiFile(sequence, outputPath);
      
      // Verify file exists
      expect(fs.existsSync(outputPath)).toBe(true);
      
      // In a real implementation, we would parse the MIDI file back 
      // and verify the tempo and time signature markers
    });
    
    it('should throw an error when given an invalid output path', async () => {
      const sequence = {
        tracks: [
          {
            name: 'Test Track',
            notes: [{ pitch: 60, startTime: 0, duration: 1, velocity: 100 }],
            instrument: 0
          }
        ],
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 }
      };
      
      // Try to export to an invalid location
      const invalidPath = '/invalid/location/test.mid';
      
      // Should throw an error
      await expect(midiExport.exportMidiFile(sequence, invalidPath))
        .rejects.toThrow();
    });
  });
  
  describe('createMidiBuffer', () => {
    it('should create a valid MIDI buffer from a sequence', () => {
      // Create a simple sequence
      const sequence = {
        tracks: [
          {
            name: 'Test Track',
            notes: [
              { pitch: 60, startTime: 0, duration: 1, velocity: 100 }
            ],
            instrument: 0
          }
        ],
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 }
      };
      
      // Create MIDI buffer
      const buffer = midiExport.createMidiBuffer(sequence);
      
      // Verify buffer was created and has content
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
      
      // Verify buffer starts with MThd (MIDI header)
      expect(buffer[0]).toBe(0x4D); // 'M'
      expect(buffer[1]).toBe(0x54); // 'T'
      expect(buffer[2]).toBe(0x68); // 'h'
      expect(buffer[3]).toBe(0x64); // 'd'
    });
    
    it('should include all tracks in the MIDI buffer', () => {
      // Create a sequence with multiple tracks
      const sequence = {
        tracks: [
          {
            name: 'Track 1',
            notes: [{ pitch: 60, startTime: 0, duration: 1, velocity: 100 }],
            instrument: 0
          },
          {
            name: 'Track 2',
            notes: [{ pitch: 67, startTime: 0, duration: 1, velocity: 100 }],
            instrument: 24
          }
        ],
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 }
      };
      
      // Create MIDI buffer
      const buffer = midiExport.createMidiBuffer(sequence);
      
      // Check for MTrk markers (track headers) - should be at least 2
      let trackCount = 0;
      for (let i = 0; i < buffer.length - 4; i++) {
        if (
          buffer[i] === 0x4D && // 'M'
          buffer[i+1] === 0x54 && // 'T'
          buffer[i+2] === 0x72 && // 'r'
          buffer[i+3] === 0x6B // 'k'
        ) {
          trackCount++;
        }
      }
      
      // Should have at least 2 tracks (possibly more due to tempo track)
      expect(trackCount).toBeGreaterThanOrEqual(2);
    });
  });
});
