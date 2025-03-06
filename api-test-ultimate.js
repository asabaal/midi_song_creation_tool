// Ultimate API test script - no external dependencies
// Tests both original paths and fixed pattern generators

const http = require('http');

// Base URL for the API
const API_HOST = 'localhost';
const API_PORT = 3003; // Match the port in ultimate-fix-api.js

// Colors for terminal output
const Colors = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m'
};

// Utility function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    // Request options
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Create request
    const req = http.request(options, (res) => {
      let responseData = '';
      
      // Collect response data
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // Process complete response
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`${Colors.BLUE}► Response from ${method} ${path}: ${res.statusCode}${Colors.RESET}`);
          
          if (res.statusCode >= 400) {
            console.error(`${Colors.RED}✗ Error response:${Colors.RESET}`, parsedData);
            reject(new Error(`API Error: ${parsedData.message || 'Unknown error'}`));
          } else {
            resolve(parsedData);
          }
        } catch (error) {
          console.error(`${Colors.RED}✗ Failed to parse response as JSON:${Colors.RESET}`);
          console.error(responseData.substring(0, 500) + '...');
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error(`${Colors.RED}✗ Request error: ${error.message}${Colors.RESET}`);
      reject(error);
    });
    
    // Send request data if provided
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test the API by creating a session and generating patterns
async function testApi() {
  try {
    console.log(`\n${Colors.CYAN}${Colors.BOLD}Starting comprehensive API test...${Colors.RESET}\n`);
    
    // Step 1: Test server connection
    console.log(`${Colors.MAGENTA}Step 1: Testing server connection...${Colors.RESET}`);
    const testData = await makeRequest('GET', '/test');
    console.log(`${Colors.GREEN}✓ Server response:${Colors.RESET}`, testData);
    console.log(`${Colors.GREEN}✓ Server connection test completed successfully.${Colors.RESET}\n`);
    
    // Step 2: Check available pattern generators
    console.log(`${Colors.MAGENTA}Step 2: Checking pattern generators...${Colors.RESET}`);
    const generatorsData = await makeRequest('GET', '/debug/pattern-generators');
    console.log(`${Colors.GREEN}✓ Available pattern generators:${Colors.RESET}`, generatorsData.patternGenerators);
    console.log(`${Colors.GREEN}✓ Using fixed implementations: ${generatorsData.usingFixedImplementations}${Colors.RESET}\n`);
    
    // Step 3: Create a new session
    console.log(`${Colors.MAGENTA}Step 3: Creating a new session...${Colors.RESET}`);
    const sessionData = await makeRequest('POST', '/sessions', {});
    
    if (!sessionData.success) {
      throw new Error(`Failed to create session: ${sessionData.message}`);
    }
    
    const sessionId = sessionData.sessionId;
    console.log(`${Colors.GREEN}✓ Session created with ID: ${sessionId}${Colors.RESET}\n`);
    
    // Step 4: Create a new sequence
    console.log(`${Colors.MAGENTA}Step 4: Creating a new sequence...${Colors.RESET}`);
    const sequenceData = await makeRequest('POST', `/sessions/${sessionId}/sequences`, {
      name: 'Test Sequence',
      tempo: 120,
      key: 'C major'
    });
    
    if (!sequenceData.success) {
      throw new Error(`Failed to create sequence: ${sequenceData.message}`);
    }
    
    const sequenceId = sequenceData.sequenceId;
    console.log(`${Colors.GREEN}✓ Sequence created with ID: ${sequenceId}${Colors.RESET}\n`);
    
    // Step 5: Generate a chord progression
    console.log(`${Colors.MAGENTA}Step 5: Generating a chord progression...${Colors.RESET}`);
    const progressionData = await makeRequest('POST', `/sessions/${sessionId}/patterns/chord-progression`, {
      key: 'C',
      progressionName: '1-4-5',
      scaleType: 'major',
      octave: 4,
      rhythmPattern: [4]
    });
    
    if (!progressionData.success) {
      throw new Error(`Failed to generate chord progression: ${progressionData.message}`);
    }
    
    console.log(`${Colors.GREEN}✓ Chord progression generated with ${progressionData.noteCount} notes.${Colors.RESET}\n`);
    
    // Step 6: Generate a bassline
    console.log(`${Colors.MAGENTA}Step 6: Generating a bassline...${Colors.RESET}`);
    const basslineData = await makeRequest('POST', `/sessions/${sessionId}/patterns/bassline`, {
      key: 'C',
      progressionName: '1-4-5',
      scaleType: 'major',
      octave: 3,
      rhythmPattern: [1, 0.5, 0.5]
    });
    
    if (!basslineData.success) {
      throw new Error(`Failed to generate bassline: ${basslineData.message}`);
    }
    
    console.log(`${Colors.GREEN}✓ Bassline generated with ${basslineData.noteCount} notes.${Colors.RESET}\n`);
    
    // Step 7: Generate drum pattern
    console.log(`${Colors.MAGENTA}Step 7: Generating a drum pattern...${Colors.RESET}`);
    const drumData = await makeRequest('POST', `/sessions/${sessionId}/patterns/drums`, {
      patternType: 'basic',
      measures: 2
    });
    
    if (!drumData.success) {
      throw new Error(`Failed to generate drum pattern: ${drumData.message}`);
    }
    
    console.log(`${Colors.GREEN}✓ Drum pattern generated with ${drumData.noteCount} notes.${Colors.RESET}\n`);
    
    // Step 8: Get the updated sequence to verify notes were added
    console.log(`${Colors.MAGENTA}Step 8: Retrieving the updated sequence...${Colors.RESET}`);
    const getSequenceData = await makeRequest('GET', `/sessions/${sessionId}/sequences/${sequenceId}`);
    
    if (!getSequenceData.success) {
      throw new Error(`Failed to retrieve sequence: ${getSequenceData.message}`);
    }
    
    console.log(`${Colors.GREEN}✓ Retrieved sequence with ${getSequenceData.sequence.notes.length} notes.${Colors.RESET}`);
    
    // Check if notes of different types exist
    const drumNotes = getSequenceData.sequence.notes.filter(note => note.channel === 9);
    const melodicNotes = getSequenceData.sequence.notes.filter(note => note.channel === 0);
    const bassNotes = getSequenceData.sequence.notes.filter(note => note.channel === 1);
    
    console.log(`${Colors.CYAN}  Drums: ${drumNotes.length} notes${Colors.RESET}`);
    console.log(`${Colors.CYAN}  Melodic: ${melodicNotes.length} notes${Colors.RESET}`);
    console.log(`${Colors.CYAN}  Bass: ${bassNotes.length} notes${Colors.RESET}`);
    
    // Success message with stats
    console.log(`\n${Colors.GREEN}${Colors.BOLD}✓ API test completed successfully!${Colors.RESET}`);
    console.log(`${Colors.CYAN}Total notes created: ${getSequenceData.sequence.notes.length}${Colors.RESET}`);
    console.log(`${Colors.CYAN}Using fixed pattern generators: ${generatorsData.usingFixedImplementations}${Colors.RESET}`);
    
  } catch (error) {
    console.error(`\n${Colors.RED}${Colors.BOLD}✗ API test failed: ${error.message}${Colors.RESET}`);
    console.error(`${Colors.RED}Full error:${Colors.RESET}`, error);
    process.exit(1);
  }
}

console.log(`${Colors.CYAN}${Colors.BOLD}===========================================`);
console.log(`MIDI Song Creation Tool - Ultimate API Test`);
console.log(`Testing API at http://${API_HOST}:${API_PORT}/api`);
console.log(`Make sure the server is running with:`);
console.log(`  node ultimate-fix-api.js`);
console.log(`============================================${Colors.RESET}\n`);

// Run the test
testApi();
