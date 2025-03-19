/**
 * API Service for the MIDI Song Creation Tool
 * Handles communication with the backend server
 */

/**
 * Generate a musical pattern (chord, bassline, or drum)
 * 
 * @param {string} sessionId - ID of the current session
 * @param {Object} params - Pattern generation parameters
 * @param {boolean} preview - If true, generate a preview without saving to session
 * @returns {Promise<Object>} Promise resolving to the generated pattern
 */
export async function generatePattern(sessionId, params, preview = false) {
  try {
    console.log(`DEBUG apiService - generatePattern called with sessionId: ${sessionId}, type: ${params.type}, preview: ${preview}`);
    
    if (!sessionId) {
      console.error('DEBUG apiService - ERROR: Missing sessionId in generatePattern call');
      throw new Error('Session ID is required for pattern generation');
    }

    // Use the API endpoint format that matches our server routes
    const url = `/api/patterns/${params.type}/${sessionId}${preview ? '?preview=true' : ''}`;
    console.log(`DEBUG apiService - Making request to URL: ${url}`);
    
    // Additional checks on URL to detect issues
    if (!url.includes('session_') && !url.includes('new-session')) {
      console.warn(`DEBUG apiService - WARNING: URL may be malformed, missing expected session ID format: ${url}`);
    }
    
    // Create the request body with full details
    const requestBody = {
      ...params,
      sessionId: sessionId, // Include sessionId in body too for redundancy
      preview: preview      // Also include in body for older APIs
    };
    
    console.log(`DEBUG apiService - Request body: ${JSON.stringify(requestBody)}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`DEBUG apiService - Response status: ${response.status}`);
    
    // Log full response headers for debugging
    const responseHeaders = {};
    response.headers.forEach((value, name) => {
      responseHeaders[name] = value;
    });
    console.log(`DEBUG apiService - Response headers: ${JSON.stringify(responseHeaders)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG apiService - Pattern generation failed:', errorData);
      throw new Error(errorData.message || `Failed to generate ${params.type} pattern`);
    }
    
    const result = await response.json();
    console.log(`DEBUG apiService - API call successful, received ${result.noteCount || 0} notes`);
    return result;
  } catch (error) {
    console.error('DEBUG apiService - ERROR during API call:', error);
    console.error('DEBUG apiService - Error stack:', error.stack);
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
    console.log('DEBUG apiService - Creating new session with params:', sessionParams);
    
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionParams)
    });
    
    console.log(`DEBUG apiService - createSession response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG apiService - Session creation failed:', errorData);
      throw new Error(errorData.message || 'Failed to create session');
    }
    
    const result = await response.json();
    console.log('DEBUG apiService - Session created successfully:', result);
    return result;
  } catch (error) {
    console.error('DEBUG apiService - ERROR during session creation:', error);
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
    console.log(`DEBUG apiService - Getting session with ID: ${sessionId}`);
    
    const response = await fetch(`/api/sessions/${sessionId}`);
    
    console.log(`DEBUG apiService - getSession response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG apiService - Get session failed:', errorData);
      throw new Error(errorData.message || 'Failed to get session');
    }
    
    const result = await response.json();
    console.log('DEBUG apiService - Session retrieved successfully');
    return result;
  } catch (error) {
    console.error('DEBUG apiService - ERROR during session retrieval:', error);
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
    console.log(`DEBUG apiService - Exporting MIDI for session: ${sessionId}`);
    
    const response = await fetch(`/api/export/midi/${sessionId}`);
    
    console.log(`DEBUG apiService - exportMidi response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG apiService - MIDI export failed:', errorData);
      throw new Error(errorData.message || 'Failed to export MIDI');
    }
    
    const blob = await response.blob();
    console.log('DEBUG apiService - MIDI exported successfully');
    return blob;
  } catch (error) {
    console.error('DEBUG apiService - ERROR during MIDI export:', error);
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
    console.log(`DEBUG apiService - Exporting JSON for session: ${sessionId}`);
    
    const response = await fetch(`/api/export/json/${sessionId}`);
    
    console.log(`DEBUG apiService - exportJson response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG apiService - JSON export failed:', errorData);
      throw new Error(errorData.message || 'Failed to export JSON');
    }
    
    const result = await response.json();
    console.log('DEBUG apiService - JSON exported successfully');
    return result;
  } catch (error) {
    console.error('DEBUG apiService - ERROR during JSON export:', error);
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
    console.log(`DEBUG apiService - Importing JSON into session: ${sessionId}`);
    
    const response = await fetch(`/api/sessions/${sessionId}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    });
    
    console.log(`DEBUG apiService - importJson response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG apiService - JSON import failed:', errorData);
      throw new Error(errorData.message || 'Failed to import JSON');
    }
    
    const result = await response.json();
    console.log('DEBUG apiService - JSON imported successfully');
    return result;
  } catch (error) {
    console.error('DEBUG apiService - ERROR during JSON import:', error);
    throw error;
  }
}
