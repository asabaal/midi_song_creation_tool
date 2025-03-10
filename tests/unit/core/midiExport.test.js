// tests/unit/core/midiExport.test.js
const { MidiExporter } = require('../../../src/core/midiExport');
const MidiSequence = require('../../../src/core/midiSequence');
const fs = require('fs');
const path = require('path');

// Mock fs.writeFileSync to prevent actual file writing during tests
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ isDirectory: () => true })
  }
}));

describe('MidiExporter', () => {
  let exporter;
  let sequence;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a test sequence
    sequence = new MidiSequence({
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 }
    });
    
    // Add some notes to the sequence
    const trackIndex = 0;
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    sequence.addNote(trackIndex, {
      pitch: 64,
      startTime: 1,
      duration: 1,
      velocity: 100
    });
    
    exporter = new MidiExporter();
  });
  
  test('should convert sequence to MIDI format', () => {
    const midiData = exporter.sequenceToMidi(sequence);
    
    // Check that MIDI data is created
    expect(midiData).toBeDefined();
    expect(midiData.header).toBeDefined();
    expect(midiData.tracks).toBeDefined();
    
    // Check header properties
    expect(midiData.header.format).toBe(1);
    expect(midiData.header.numTracks).toBe(sequence.tracks.length + 1); // +1 for tempo track
    expect(midiData.header.ticksPerBeat).toBeGreaterThan(0);
    
    // Check if tempo track exists
    expect(midiData.tracks[0].length).toBeGreaterThan(0);
    
    // Check if notes are included in the MIDI data
    expect(midiData.tracks[1].length).toBeGreaterThan(0);
  });
  
  test('should save MIDI file', async () => {
    const filePath = path.join('tests', 'fixtures', 'output', 'test.mid');
    
    await exporter.saveToFile(sequence, filePath);
    
    // Check if file was "saved" (mock called)
    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.writeFile.mock.calls[0][0]).toBe(filePath);
    expect(fs.promises.writeFile.mock.calls[0][1]).toBeInstanceOf(Buffer);
  });
  
  test('should handle empty sequence', () => {
    const emptySequence = new MidiSequence({
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 }
    });
    
    // Remove the default track to make it truly empty
    emptySequence.tracks = [];
    
    const midiData = exporter.sequenceToMidi(emptySequence);
    
    // Should still create a valid MIDI file with just the tempo track
    expect(midiData).toBeDefined();
    expect(midiData.header).toBeDefined();
    expect(midiData.tracks).toBeDefined();
    expect(midiData.tracks.length).toBe(1); // Just the tempo track
  });
  
  test('should preserve track-specific properties', () => {
    // Add a track with specific name and instrument
    const trackIndex = sequence.addTrack({
      name: 'Piano',
      instrument: 0
    });
    
    // Add a note to this new track
    sequence.addNote(trackIndex, {
      pitch: 60,
      startTime: 0,
      duration: 1,
      velocity: 100
    });
    
    const midiData = exporter.sequenceToMidi(sequence);
    
    // There should be at least 3 tracks (tempo + original + new)
    expect(midiData.tracks.length).toBeGreaterThan(2);
    
    // Get the track we added (track 0 is tempo, track 1 is default track, track 2 is our new one)
    const trackEvents = midiData.tracks[2];
    
    // Find track name meta event
    const trackNameEvent = trackEvents.find(event => 
      event.type === 'trackName' && event.text === 'Piano'
    );
    
    // Find program change event for instrument
    const programChangeEvent = trackEvents.find(event => 
      event.type === 'programChange' && event.programNumber === 0
    );
    
    expect(trackNameEvent).toBeDefined();
    expect(programChangeEvent).toBeDefined();
  });
});