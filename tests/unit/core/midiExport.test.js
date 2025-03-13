// tests/unit/core/midiExport.test.js
const { sessionToMidiFile, sequenceToMidiFile } = require('../../../src/core/midiExport');

// Mock the MidiWriter module
jest.mock('midi-writer-js', () => {
  const mockEventInstance = {
    addEvent: jest.fn(),
  };

  const mockWriterInstance = {
    setTempo: jest.fn(),
    setTimeSignature: jest.fn(),
    buildFile: jest.fn().mockReturnValue('mockMidiData'),
  };

  return {
    Track: jest.fn().mockImplementation(() => mockEventInstance),
    Writer: jest.fn().mockImplementation(() => mockWriterInstance),
    NoteEvent: jest.fn().mockImplementation(options => options),
    ProgramChangeEvent: jest.fn().mockImplementation(options => options),
  };
});

describe('MIDI Export Functionality', () => {
  describe('sessionToMidiFile', () => {
    it('should export a session to MIDI format', async () => {
      // Mock session with tracks and notes
      const mockSession = {
        bpm: 120,
        timeSignature: [4, 4],
        tracks: [
          {
            id: 1,
            name: 'Chord Track',
            instrument: 0,
            notes: [
              { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
              { pitch: 64, startTime: 0, duration: 1, velocity: 100 },
              { pitch: 67, startTime: 0, duration: 1, velocity: 100 },
            ],
          },
          {
            id: 2,
            name: 'Bass Track',
            instrument: 32,
            notes: [
              { pitch: 36, startTime: 0, duration: 0.5, velocity: 100 },
              { pitch: 48, startTime: 0.5, duration: 0.5, velocity: 100 },
            ],
          },
        ],
      };

      const midiBuffer = await sessionToMidiFile(mockSession);
      
      // Check if we got a buffer
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });

    it('should handle sessions with no tracks', async () => {
      const mockSession = {
        bpm: 120,
        timeSignature: [4, 4],
        tracks: [],
      };

      const midiBuffer = await sessionToMidiFile(mockSession);
      
      // Even with no tracks, we should get a valid (empty) MIDI file
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });

    it('should handle sessions with no notes', async () => {
      const mockSession = {
        bpm: 120,
        timeSignature: [4, 4],
        tracks: [
          {
            id: 1,
            name: 'Empty Track',
            instrument: 0,
            notes: [],
          },
        ],
      };

      const midiBuffer = await sessionToMidiFile(mockSession);
      
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Passing null should reject the promise
      await expect(sessionToMidiFile(null)).rejects.toThrow();
    });
  });

  describe('sequenceToMidiFile', () => {
    it('should export a sequence to MIDI format', async () => {
      // Mock a sequence object (old format)
      const mockSequence = {
        id: 'seq123',
        name: 'Test Sequence',
        timeSignature: { numerator: 4, denominator: 4 },
        tempo: 120,
        key: 'C major',
        notes: [
          { pitch: 60, startTime: 0, duration: 1, velocity: 80, channel: 0 },
          { pitch: 64, startTime: 0, duration: 1, velocity: 80, channel: 0 },
          { pitch: 67, startTime: 0, duration: 1, velocity: 80, channel: 0 },
          { pitch: 36, startTime: 0, duration: 0.5, velocity: 100, channel: 1 },
        ],
      };

      const midiBuffer = await sequenceToMidiFile(mockSequence);
      
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });

    it('should handle sequences with no notes', async () => {
      const mockSequence = {
        id: 'seq123',
        name: 'Empty Sequence',
        timeSignature: { numerator: 4, denominator: 4 },
        tempo: 120,
        key: 'C major',
        notes: [],
      };

      const midiBuffer = await sequenceToMidiFile(mockSequence);
      
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });

    it('should handle alternative timeSignature formats', async () => {
      // Test with array format for timeSignature
      const mockSequence = {
        id: 'seq123',
        name: 'Test Sequence',
        timeSignature: [3, 4], // 3/4 time as array
        tempo: 120,
        key: 'C major',
        notes: [
          { pitch: 60, startTime: 0, duration: 1, velocity: 80, channel: 0 },
        ],
      };

      const midiBuffer = await sequenceToMidiFile(mockSequence);
      
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });

    it('should use default values when properties are missing', async () => {
      // Test with minimal sequence data
      const mockSequence = {
        notes: [
          { pitch: 60, startTime: 0, duration: 1 },
        ],
      };

      const midiBuffer = await sequenceToMidiFile(mockSequence);
      
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });
  });

  describe('Duration conversion', () => {
    it('should convert duration to appropriate MIDI format', async () => {
      // Test with different note durations
      const mockSession = {
        bpm: 120,
        timeSignature: [4, 4],
        tracks: [
          {
            id: 1,
            name: 'Duration Test',
            instrument: 0,
            notes: [
              { pitch: 60, startTime: 0, duration: 4 },    // Whole note
              { pitch: 62, startTime: 4, duration: 2 },    // Half note
              { pitch: 64, startTime: 6, duration: 1 },    // Quarter note
              { pitch: 65, startTime: 7, duration: 0.5 },  // Eighth note
              { pitch: 67, startTime: 7.5, duration: 0.25 }, // Sixteenth note
              { pitch: 69, startTime: 7.75, duration: 0.123 }, // Custom duration
            ],
          },
        ],
      };

      const midiBuffer = await sessionToMidiFile(mockSession);
      
      expect(midiBuffer).toBeTruthy();
      expect(Buffer.isBuffer(midiBuffer)).toBe(true);
    });
  });
});
