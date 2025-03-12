// scripts/fix_specific_line.js
const fs = require('fs');
const path = require('path');

/**
 * Fix specific line in a file
 * @param {string} filePath - Path to the file
 * @param {number} lineNumber - Line number to fix (1-based)
 * @param {Function} fixFunction - Function to apply to the line
 */
function fixSpecificLine(filePath, lineNumber, fixFunction) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Split into lines
    const lines = content.split('\n');
    
    // Check if the line exists
    if (lines.length < lineNumber || lineNumber < 1) {
      console.error(`Line ${lineNumber} does not exist in ${filePath}`);
      return;
    }
    
    // Apply fix to the line (convert to 0-based index)
    const originalLine = lines[lineNumber - 1];
    const fixedLine = fixFunction(originalLine);
    
    // Replace the line
    lines[lineNumber - 1] = fixedLine;
    
    // Join lines back together
    const fixedContent = lines.join('\n');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    console.log(`Fixed line ${lineNumber} in ${filePath}`);
    console.log(`Original: "${originalLine}"`);
    console.log(`Fixed:    "${fixedLine}"`);
  } catch (error) {
    console.error(`Error fixing line ${lineNumber} in ${filePath}:`, error);
  }
}

// Fix specific issues in the codebase
function main() {
  const rootDir = path.resolve(__dirname, '..');
  
  // Fix line 208 in midiSequence.js - trailing whitespace issue
  fixSpecificLine(
    path.join(rootDir, 'src/core/midiSequence.js'),
    208,
    line => line.trimEnd()
  );
  
  // Add more specific fixes here as needed
}

// Run the main function
main();
