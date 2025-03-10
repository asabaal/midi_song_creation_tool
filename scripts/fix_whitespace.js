// Fix whitespace issues in problematic files
const fs = require('fs');
const path = require('path');

// Files that need whitespace fixes
const files = [
  path.join(__dirname, '../src/core/midiExport.js'),
  path.join(__dirname, '../src/core/musicTheory.js')
];

// Fix each file
files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    return;
  }

  // Read the file
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace problematic whitespace patterns
  content = content.replace(/\s+\n/g, '\n');  // Remove whitespace at end of lines
  
  // Save the file
  fs.writeFileSync(file, content, 'utf8');
  
  console.log(`Fixed whitespace in ${file}`);
});

console.log('Whitespace issues fixed!');
