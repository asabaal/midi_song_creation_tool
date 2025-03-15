// scripts/fix_whitespace.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Find all JavaScript files in the given directory
 * @param {string} dir - Directory to search
 * @returns {Array<string>} - Array of file paths
 */
const findJsFiles = dir => {
  try {
    const result = execSync(`find ${dir} -type f -name "*.js" -o -name "*.jsx"`, {
      encoding: 'utf8',
    });
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding JS files:', error);
    return [];
  }
};

/**
 * Fix trailing whitespace in a file
 * @param {string} filePath - Path to the file
 */
const fixTrailingWhitespace = filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Split into lines
    const lines = content.split('\n');

    // Keep track of whether any changes were made
    let changesMade = false;

    // Trim trailing whitespace from each line
    const fixedLines = lines.map(line => {
      const trimmed = line.trimEnd();
      if (trimmed !== line) {
        changesMade = true;
      }
      return trimmed;
    });

    // If changes were made, write the fixed content back to the file
    if (changesMade) {
      // Join lines back together
      const fixedContent = fixedLines.join('\n');

      // Write the fixed content back to the file
      fs.writeFileSync(filePath, fixedContent, 'utf8');

      console.log(`Fixed trailing whitespace in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing whitespace in ${filePath}:`, error);
  }
};

/**
 * Fix blank lines at end of file
 * @param {string} filePath - Path to the file
 */
const fixEndOfFile = filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Ensure file ends with exactly one newline
    const fixedContent = content.trimEnd() + '\n';

    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed end of file in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing end of file in ${filePath}:`, error);
  }
};

/**
 * Main function
 */
const main = () => {
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.join(rootDir, 'src');

  console.log('Fixing whitespace issues...');

  // Find all JS files
  const files = findJsFiles(srcDir);

  // Process each file
  let filesProcessed = 0;

  for (const file of files) {
    fixTrailingWhitespace(file);
    fixEndOfFile(file);
    filesProcessed++;
  }

  console.log(`Processed ${filesProcessed} files`);
};

// Run the main function
main();
