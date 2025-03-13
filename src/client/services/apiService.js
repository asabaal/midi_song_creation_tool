// src/client/services/apiService.js

const API_BASE_URL = '/api';

/**
 * Generic request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Session API
 */
export const SessionAPI = {
  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session
   */
  create: async (sessionData) => {
    return request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },
  
  /**
   * Get all sessions
   * @returns {Promise<Array>} List of sessions
   */
  getAll: async () => {
    return request('/sessions');
  },
  
  /**
   * Get a session by ID
   * @param {string} id - Session ID
   * @returns {Promise<Object>} Session data
   */
  getById: async (id) => {
    return request(`/sessions/${id}`);
  },
  
  /**
   * Update a session
   * @param {string} id - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise<Object>} Updated session
   */
  update: async (id, sessionData) => {
    return request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    });
  },
  
  /**
   * Delete a session
   * @param {string} id - Session ID
   * @returns {Promise<Object>} Deletion result
   */
  delete: async (id) => {
    return request(`/sessions/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * Notes API
 */
export const NotesAPI = {
  /**
   * Add notes to a track
   * @param {string} sessionId - Session ID
   * @param {number} trackId - Track ID
   * @param {Array} notes - Notes to add
   * @returns {Promise<Object>} Updated track
   */
  add: async (sessionId, trackId, notes) => {
    return request(`/sessions/${sessionId}/tracks/${trackId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  },
  
  /**
   * Delete notes from a track
   * @param {string} sessionId - Session ID
   * @param {number} trackId - Track ID
   * @param {Array} noteIds - IDs of notes to delete
   * @returns {Promise<Object>} Updated track
   */
  delete: async (sessionId, trackId, noteIds) => {
    return request(`/sessions/${sessionId}/tracks/${trackId}/notes`, {
      method: 'DELETE',
      body: JSON.stringify({ noteIds })
    });
  }
};

/**
 * Music Theory API
 */
export const MusicTheoryAPI = {
  /**
   * Get a scale
   * @param {string} root - Root note
   * @param {string} type - Scale type
   * @param {number} octave - Octave
   * @returns {Promise<Object>} Scale data
   */
  getScale: async (root, type, octave = 4) => {
    return request(`/music-theory/scales/${root}/${type}?octave=${octave}`);
  },
  
  /**
   * Get a chord
   * @param {string} root - Root note
   * @param {string} type - Chord type
   * @param {number} octave - Octave
   * @returns {Promise<Object>} Chord data
   */
  getChord: async (root, type, octave = 4) => {
    return request(`/music-theory/chords/${root}/${type}?octave=${octave}`);
  },
  
  /**
   * Get a chord progression
   * @param {string} key - Key
   * @param {string} mode - Mode
   * @param {string} numerals - Chord numerals
   * @param {number} octave - Octave
   * @returns {Promise<Object>} Progression data
   */
  getProgression: async (key, mode, numerals = 'I-IV-V-I', octave = 4) => {
    return request(`/music-theory/progressions/${key}/${mode}?numerals=${numerals}&octave=${octave}`);
  }
};
