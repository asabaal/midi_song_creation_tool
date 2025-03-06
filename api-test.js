// Simple script to test the MIDI Song Creation Tool API directly
const fetch = require('node-fetch');

// Base URL for the API
const API_URL = 'http://localhost:3002/api';

// Test the API by creating a session and generating a chord progression
async function testApi() {
  try {
    console.log('Starting API test...\n');
    
    // Step 1: Test server connection
    console.log('Step 1: Testing server connection...');
    const testResponse = await fetch(`${API_URL}/test`);
    const testData = await testResponse.json();
    console.log('Server response:', testData);
    console.log('Server connection test completed successfully.\n');
    
    // Step 2: Create a new session
    console.log('Step 2: Creating a new session...');
    const sessionResponse = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const sessionData = await sessionResponse.json();
    
    if (!sessionData.success) {
      throw new Error(`Failed to create session: ${sessionData.message}`);
    }
    
    const sessionId = sessionData.sessionId;
    console.log(`Session created with ID: ${sessionId}\n`);
    
    // Step 3: Create a new sequence
    console.log('Step 3: Creating a new sequence...');
    const sequenceResponse = await fetch(`${API_URL}/sessions/${sessionId}/sequences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Sequence',
        tempo: 120,
        key: 'C major'
      })
    });
    const sequenceData = await sequenceResponse.json();
    
    if (!sequenceData.success) {
      throw new Error(`Failed to create sequence: ${sequenceData.message}`);
    }
    
    const sequenceId = sequenceData.sequenceId;
    console.log(`Sequence created with ID: ${sequenceId}\n`);
    
    // Step 4: Generate a chord progression
    console.log('Step 4: Generating a chord progression...');
    const progressionResponse = await fetch(`${API_URL}/sessions/${sessionId}/patterns/chord-progression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'C',
        progressionName: '1-4-5',
        scaleType: 'major',
        octave: 4,
        rhythmPattern: [4]
      })
    });
    
    const progressionData = await progressionResponse.json();
    console.log('Chord progression generation response:', progressionData);
    
    if (!progressionData.success) {
      throw new Error(`Failed to generate chord progression: ${progressionData.message}`);
    }
    
    console.log(`Chord progression generated with ${progressionData.noteCount} notes.\n`);
    
    // Step 5: Get the updated sequence to verify notes were added
    console.log('Step 5: Retrieving the updated sequence...');
    const getSequenceResponse = await fetch(`${API_URL}/sessions/${sessionId}/sequences/${sequenceId}`);
    const getSequenceData = await getSequenceResponse.json();
    
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

// Run the test
testApi();
