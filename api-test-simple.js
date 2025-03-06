// Simple script to test the MIDI Song Creation Tool API without external dependencies
// Uses built-in http module instead of node-fetch

const http = require('http');

// Base URL for the API
const API_HOST = 'localhost';
const API_PORT = 3003; // Match the port in error-fix-api.js

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
          console.log(`Response from ${method} ${path}: ${res.statusCode}`);
          
          if (res.statusCode >= 400) {
            console.error('Error response:', parsedData);
            reject(new Error(`API Error: ${parsedData.message || 'Unknown error'}`));
          } else {
            resolve(parsedData);
          }
        } catch (error) {
          console.error('Failed to parse response as JSON:');
          console.error(responseData.substring(0, 500) + '...');
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });
    
    // Send request data if provided
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test the API by creating a session and generating a chord progression
async function testApi() {
  try {
    console.log('Starting API test...\n');
    
    // Step 1: Test server connection
    console.log('Step 1: Testing server connection...');
    const testData = await makeRequest('GET', '/test');
    console.log('Server response:', testData);
    console.log('Server connection test completed successfully.\n');
    
    // Step 2: Create a new session
    console.log('Step 2: Creating a new session...');
    const sessionData = await makeRequest('POST', '/sessions', {});
    
    if (!sessionData.success) {
      throw new Error(`Failed to create session: ${sessionData.message}`);
    }
    
    const sessionId = sessionData.sessionId;
    console.log(`Session created with ID: ${sessionId}\n`);
    
    // Step 3: Create a new sequence
    console.log('Step 3: Creating a new sequence...');
    const sequenceData = await makeRequest('POST', `/sessions/${sessionId}/sequences`, {
      name: 'Test Sequence',
      tempo: 120,
      key: 'C major'
    });
    
    if (!sequenceData.success) {
      throw new Error(`Failed to create sequence: ${sequenceData.message}`);
    }
    
    const sequenceId = sequenceData.sequenceId;
    console.log(`Sequence created with ID: ${sequenceId}\n`);
    
    // Step 4: Generate a chord progression
    console.log('Step 4: Generating a chord progression...');
    const progressionData = await makeRequest('POST', `/sessions/${sessionId}/patterns/chord-progression`, {
      key: 'C',
      progressionName: '1-4-5',
      scaleType: 'major',
      octave: 4,
      rhythmPattern: [4]
    });
    
    console.log('Chord progression generation response:', progressionData);
    
    if (!progressionData.success) {
      throw new Error(`Failed to generate chord progression: ${progressionData.message}`);
    }
    
    console.log(`Chord progression generated with ${progressionData.noteCount} notes.\n`);
    
    // Step 5: Get the updated sequence to verify notes were added
    console.log('Step 5: Retrieving the updated sequence...');
    const getSequenceData = await makeRequest('GET', `/sessions/${sessionId}/sequences/${sequenceId}`);
    
    if (!getSequenceData.success) {
      throw new Error(`Failed to retrieve sequence: ${getSequenceData.message}`);
    }
    
    console.log(`Retrieved sequence with ${getSequenceData.sequence.notes.length} notes.`);
    if (getSequenceData.sequence.notes.length > 0) {
      console.log('First few notes:', getSequenceData.sequence.notes.slice(0, 3));
    } else {
      console.log('Warning: No notes found in the sequence!');
    }
    
    console.log('\nAPI test completed successfully!');
    
  } catch (error) {
    console.error('\nAPI test failed:', error.message);
    console.error('Full error:', error);
  }
}

console.log('===========================================');
console.log('MIDI Song Creation Tool - API Test Script');
console.log(`Testing API at http://${API_HOST}:${API_PORT}/api`);
console.log('Make sure the server is running with:');
console.log('  node error-fix-api.js');
console.log('===========================================\n');

// Run the test
testApi();
