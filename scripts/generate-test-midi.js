/**
 * Script to generate MIDI test files for the test suite
 * This creates various MIDI files with different features for testing
 */
const fs = require('fs');
const path = require('path');

// Create fixtures directory if it doesn't exist
const fixturesDir = path.join(__dirname, '../tests/fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

/**
 * Generate a simple MIDI file with a C major scale
 */
function generateCMajorScaleMIDI() {
  // Basic MIDI file headers
  const header = Buffer.from('MThd' + 
    '\\x00\\x00\\x00\\x06' + // Header length (6 bytes)
    '\\x00\\x01' +         // Format (1 - multiple track)
    '\\x00\\x02' +         // Number of tracks (2)
    '\\x00\\x60',          // Division (96 ticks per quarter note)
  'binary');
  
  // First track (tempo track)
  const track1Data = [
    '00', 'FF', '51', '03', '07', 'A1', '20', // Set tempo (500,000 microseconds per quarter note)
    '00', 'FF', '58', '04', '04', '02', '18', '08', // Time signature (4/4)
    '00', 'FF', '2F', '00' // End of track
  ];
  const track1 = Buffer.from('MTrk' + 
    '\\x00\\x00\\x00' + String.fromCharCode(track1Data.length) + // Track length
    track1Data.map(hex => String.fromCharCode(parseInt(hex, 16))).join(''),
  'binary');
  
  // Second track (C major scale)
  const track2Data = [
    '00', 'FF', '03', '0C', '43', '20', '4D', '61', '6A', '6F', '72', '20', '53', '63', '61', '6C', '65', // Track name
    '00', '90', '3C', '64', // Note on: C4, velocity 100
    '60', '80', '3C', '40', // Note off: C4, after 96 ticks
    '00', '90', '3E', '64', // Note on: D4, velocity 100
    '60', '80', '3E', '40', // Note off: D4, after 96 ticks
    '00', '90', '40', '64', // Note on: E4, velocity 100
    '60', '80', '40', '40', // Note off: E4, after 96 ticks
    '00', '90', '41', '64', // Note on: F4, velocity 100
    '60', '80', '41', '40', // Note off: F4, after 96 ticks
    '00', '90', '43', '64', // Note on: G4, velocity 100
    '60', '80', '43', '40', // Note off: G4, after 96 ticks
    '00', '90', '45', '64', // Note on: A4, velocity 100
    '60', '80', '45', '40', // Note off: A4, after 96 ticks
    '00', '90', '47', '64', // Note on: B4, velocity 100
    '60', '80', '47', '40', // Note off: B4, after 96 ticks
    '00', '90', '48', '64', // Note on: C5, velocity 100
    '60', '80', '48', '40', // Note off: C5, after 96 ticks
    '00', 'FF', '2F', '00'  // End of track
  ];
  
  const track2 = Buffer.from('MTrk' + 
    '\\x00\\x00\\x00' + String.fromCharCode(track2Data.length) + // Track length
    track2Data.map(hex => String.fromCharCode(parseInt(hex, 16))).join(''),
  'binary');
  
  // Combine all segments
  const midiFile = Buffer.concat([header, track1, track2]);
  
  // Write to file
  fs.writeFileSync(path.join(fixturesDir, 'c-major-scale.mid'), midiFile);
  console.log('Generated C major scale MIDI file');
}

/**
 * Generate a MIDI file with a C major chord
 */
function generateCMajorChordMIDI() {
  // Basic MIDI file headers
  const header = Buffer.from('MThd' + 
    '\\x00\\x00\\x00\\x06' + // Header length (6 bytes)
    '\\x00\\x01' +         // Format (1 - multiple track)
    '\\x00\\x02' +         // Number of tracks (2)
    '\\x00\\x60',          // Division (96 ticks per quarter note)
  'binary');
  
  // First track (tempo track)
  const track1Data = [
    '00', 'FF', '51', '03', '07', 'A1', '20', // Set tempo (500,000 microseconds per quarter note)
    '00', 'FF', '58', '04', '04', '02', '18', '08', // Time signature (4/4)
    '00', 'FF', '2F', '00' // End of track
  ];
  const track1 = Buffer.from('MTrk' + 
    '\\x00\\x00\\x00' + String.fromCharCode(track1Data.length) + // Track length
    track1Data.map(hex => String.fromCharCode(parseInt(hex, 16))).join(''),
  'binary');
  
  // Second track (C major chord)
  const track2Data = [
    '00', 'FF', '03', '0D', '43', '20', '4D', '61', '6A', '6F', '72', '20', '43', '68', '6F', '72', '64', // Track name
    '00', '90', '3C', '64', // Note on: C4, velocity 100
    '00', '90', '40', '64', // Note on: E4, velocity 100
    '00', '90', '43', '64', // Note on: G4, velocity 100
    '81', '40', '80', '3C', '40', // Note off: C4, after 192 ticks (half note)
    '00', '80', '40', '40', // Note off: E4
    '00', '80', '43', '40', // Note off: G4
    '00', 'FF', '2F', '00'  // End of track
  ];
  
  const track2 = Buffer.from('MTrk' + 
    '\\x00\\x00\\x00' + String.fromCharCode(track2Data.length) + // Track length
    track2Data.map(hex => String.fromCharCode(parseInt(hex, 16))).join(''),
  'binary');
  
  // Combine all segments
  const midiFile = Buffer.concat([header, track1, track2]);
  
  // Write to file
  fs.writeFileSync(path.join(fixturesDir, 'c-major-chord.mid'), midiFile);
  console.log('Generated C major chord MIDI file');
}

// Generate MIDI test files
generateCMajorScaleMIDI();
generateCMajorChordMIDI();

console.log('All test MIDI files generated successfully!');
