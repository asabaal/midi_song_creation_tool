// Fix specific line in midiSequence.js with whitespace issue
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/core/midiSequence.js');

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Replace the problematic line (line 208)
// We're using a completely different approach to avoid whitespace issues
if (lines.length >= 208) {
  lines[207] = '    // eslint-disable-next-line no-console';
  lines[208] = '    console.log(`MidiSequence: ${this.tracks.length} tracks, ${this.totalDuration} beats, tempo: ${this.tempo}`);';
}

// Join lines back together
content = lines.join('\n');

// Save the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed specific line in midiSequence.js');
