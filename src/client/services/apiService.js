/**
 * API Service for the MIDI Song Creation Tool
 * Handles communication with the backend server
 */

/**
 * Generate a musical pattern (chord, bassline, or drum)
 * 
 * @param {string} sessionId - ID of the current session
 * @param {Object} params - Pattern generation parameters
 * @returns {Promise<Object>} Promise resolving to the generated pattern
 */
export async function generatePattern(sessionId, params) {
  try {
    console.log(`Making API call to generate ${params.type} pattern for session ${sessionId}`);
    
    if (!sessionId) {
      throw new Error('Session ID is required for pattern generation');
    }

    // Use the API endpoint format that matches our server routes
    const response = await fetch(`/api/patterns/${params.type}/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        sessionId: sessionId // Include sessionId in body too for redundancy
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pattern generation failed:', errorData);
      throw new Error(errorData.message || `Failed to generate ${params.type} pattern`);
    }
    
    const result = await response.json();
    console.log(`Successfully generated ${params.type} pattern with ${result.noteCount || 0} notes`);
    return result;
  } catch (error) {
    console.error('API error during pattern generation:', error);
    throw error;
  }
}

/**
 * Create a new session
 * 
 * @param {Object} sessionParams - Session parameters (name, bpm, etc)
 * @returns {Promise<Object>} Promise resolving to the created session
 */
export async function createSession(sessionParams = {}) {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionParams)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create session');
    }
    
    return response.json();
  } catch (error) {
    console.error('API error during session creation:', error);
    throw error;
  }
}

/**
 * Get session by ID
 * 
 * @param {string} sessionId - ID of the session to retrieve
 * @returns {Promise<Object>} Promise resolving to the session data
 */
export async function getSession(sessionId) {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get session');
    }
    
    return response.json();
  } catch (error) {
    console.error('API error during session retrieval:', error);
    throw error;
  }
}

/**
 * Export session as MIDI
 * 
 * @param {string} sessionId - ID of the session to export
 * @returns {Promise<Blob>} Promise resolving to the MIDI file blob
 */
export async function exportMidi(sessionId) {
  try {
    const response = await fetch(`/api/export/midi/${sessionId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export MIDI');
    }
    
    return response.blob();
  } catch (error) {
    console.error('API error during MIDI export:', error);
    throw error;
  }
}

/**
 * Export session as JSON
 * 
 * @param {string} sessionId - ID of the session to export
 * @returns {Promise<Object>} Promise resolving to the session JSON
 */
export async function exportJson(sessionId) {
  try {
    const response = await fetch(`/api/export/json/${sessionId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export JSON');
    }
    
    return response.json();
  } catch (error) {
    console.error('API error during JSON export:', error);
    throw error;
  }
}

/**
 * Import session from JSON
 * 
 * @param {string} sessionId - ID of the session to import into
 * @param {Object} jsonData - The JSON data to import
 * @returns {Promise<Object>} Promise resolving to the updated session
 */
export async function importJson(sessionId, jsonData) {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to import JSON');
    }
    
    return response.json();
  } catch (error) {
    console.error('API error during JSON import:', error);
    throw error;
  }
}
