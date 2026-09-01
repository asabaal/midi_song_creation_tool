/**
 * Chord Progression API Service
 * 
 * Handles all API communication for the chord progression explorer
 */

import { MusicTheoryAPI } from './apiService';

// Helper function to make requests to chord progression endpoints
async function request(endpoint, options = {}) {
  const url = `/api${endpoint}`;
  
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get available keys (all 24 major and minor keys)
 * @returns {Promise<Object>} Object with major, minor, and all keys arrays
 */
export const getKeys = async () => {
  try {
    return await request('/chord-progression/keys');
  } catch (error) {
    console.error('Error fetching keys:', error);
    throw error;
  }
};

/**
 * Get diatonic chords for a specific key
 * @param {string} key - Key name (e.g. 'C major', 'A minor')
 * @returns {Promise<Object>} Object with key, chords array, and count
 */
export const getDiatonicChords = async (key) => {
  try {
    const encodedKey = encodeURIComponent(key);
    return await request(`/chord-progression/diatonic-chords/${encodedKey}`);
  } catch (error) {
    console.error('Error fetching diatonic chords:', error);
    throw error;
  }
};

/**
 * Analyze a custom chord from selected notes
 * @param {Array} notes - Array of note names (e.g. ['C4', 'E4', 'G4'])
 * @returns {Promise<Object>} Analysis result with validation and chord analysis
 */
export const analyzeCustomChord = async (notes) => {
  try {
    return await request('/chord-progression/analyze-custom', {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  } catch (error) {
    console.error('Error analyzing custom chord:', error);
    throw error;
  }
};

/**
 * Generate a chord progression
 * @param {string} key - Key name (e.g. 'C major')
 * @param {Array} chords - Array of chord objects with name and duration
 * @param {number} tempo - Tempo in BPM (default: 120)
 * @returns {Promise<Object>} Generated progression with analysis
 */
export const generateProgression = async (key, chords, tempo = 120) => {
  try {
    return await request('/chord-progression/generate', {
      method: 'POST',
      body: JSON.stringify({ key, chords, tempo })
    });
  } catch (error) {
    console.error('Error generating progression:', error);
    throw error;
  }
};

/**
 * Export a progression as MIDI file
 * @param {Object} progression - Progression data from generateProgression
 * @param {string} format - Export format (currently only 'midi' supported)
 * @returns {Promise<Object>} Export result with file data
 */
export const exportProgression = async (progression, format = 'midi') => {
  try {
    return await request('/chord-progression/export', {
      method: 'POST',
      body: JSON.stringify({ progression, format })
    });
  } catch (error) {
    console.error('Error exporting progression:', error);
    throw error;
  }
};

/**
 * Get supported chord types
 * @returns {Promise<Object>} Object with chord types array and descriptions
 */
export const getChordTypes = async () => {
  try {
    return await request('/chord-progression/chord-types');
  } catch (error) {
    console.error('Error fetching chord types:', error);
    throw error;
  }
};

/**
 * Validate a complete progression
 * @param {string} key - Key name
 * @param {Array} chords - Array of chord objects
 * @param {number} tempo - Tempo in BPM
 * @returns {Promise<Object>} Validation results with errors and warnings
 */
export const validateProgression = async (key, chords, tempo = 120) => {
  try {
    return await request('/chord-progression/validate', {
      method: 'POST',
      body: JSON.stringify({ key, chords, tempo })
    });
  } catch (error) {
    console.error('Error validating progression:', error);
    throw error;
  }
};

/**
 * Download MIDI file to user's computer
 * @param {Object} midiData - MIDI data from exportProgression
 * @param {string} filename - Optional custom filename
 */
export const downloadMidiFile = (midiData, filename = null) => {
  try {
    const finalFilename = filename || midiData.filename || 'chord-progression.mid';
    
    // Create blob from base64 data
    const base64Data = midiData.base64.split(',')[1]; // Remove data URI prefix
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/midi' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading MIDI file:', error);
    throw error;
  }
};

/**
 * Helper function to create a standard chord object
 * @param {string} name - Chord name
 * @param {string} duration - Duration (e.g. '1', '1/2', '2', '4')
 * @param {boolean} custom - Whether this is a custom chord
 * @param {Array} notes - Custom chord notes (if custom)
 * @returns {Object} Standard chord object
 */
export const createChordObject = (name, duration = '1', custom = false, notes = null) => {
  const chord = {
    name,
    duration,
    custom
  };
  
  if (custom && notes) {
    chord.notes = notes;
  }
  
  return chord;
};

/**
 * Helper function to validate chord object structure
 * @param {Object} chord - Chord object to validate
 * @returns {boolean} True if valid
 */
export const validateChordObject = (chord) => {
  if (!chord || typeof chord !== 'object') {
    return false;
  }
  
  if (!chord.name && !chord.custom) {
    return false;
  }
  
  if (!chord.duration) {
    return false;
  }
  
  if (chord.custom && !chord.notes) {
    return false;
  }
  
  return true;
};

/**
 * Helper function to format duration display
 * @param {string|number} duration - Duration value
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration) => {
  if (!duration) {
    return '1 beat';
  }
  
  if (typeof duration === 'number') {
    if (duration === 1) return '1 beat';
    return `${duration} beats`;
  }
  
  if (typeof duration === 'string') {
    if (duration.includes('/')) {
      const [numerator, denominator] = duration.split('/');
      return `${numerator}/${denominator} beat${numerator !== '1' ? 's' : ''}`;
    }
    
    const num = parseFloat(duration);
    if (num === 1) return 'Whole note';
    if (num === 2) return 'Half note';
    if (num === 4) return 'Quarter note';
    if (num === 8) return 'Eighth note';
    
    return `${duration} beats`;
  }
  
  return 'Unknown duration';
};

/**
 * Helper function to calculate total duration of progression
 * @param {Array} chords - Array of chord objects
 * @param {number} tempo - Tempo in BPM
 * @returns {Object} Duration info in beats and seconds
 */
export const calculateProgressionDuration = (chords, tempo = 120) => {
  const durationToBeats = (duration) => {
    if (!duration) {
      return 1; // Default to 1 beat
    }
    
    if (typeof duration === 'number') {
      return duration;
    }
    
    if (typeof duration === 'string' && duration.includes('/')) {
      const [numerator, denominator] = duration.split('/').map(Number);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
      return 1; // Fallback for invalid fractions
    }
    
    // Handle standard musical notation (where 1 = whole note = 4 beats)
    const parsed = parseFloat(duration);
    if (!isNaN(parsed) && parsed > 0) {
      // Convert musical notation to beats
      // 1 = whole note (4 beats), 2 = half note (2 beats), 4 = quarter note (1 beat)
      if (parsed === 1) return 4;  // Whole note
      if (parsed === 2) return 2;  // Half note  
      if (parsed === 4) return 1;  // Quarter note
      if (parsed === 8) return 0.5; // Eighth note
      if (parsed === 16) return 0.25; // Sixteenth note
      return parsed; // For other values, assume they're already in beats
    }
    
    return 1; // Fallback for invalid numbers
  };
  
  const totalBeats = chords.reduce((sum, chord) => {
    return sum + durationToBeats(chord.duration);
  }, 0);
  
  const totalSeconds = (totalBeats / tempo) * 60;
  
  return {
    totalBeats,
    totalSeconds,
    formattedTime: formatTime(totalSeconds)
  };
};

/**
 * Helper function to format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Export all functions as a named export object for convenience
const chordProgressionService = {
  getKeys,
  getDiatonicChords,
  analyzeCustomChord,
  generateProgression,
  exportProgression,
  getChordTypes,
  validateProgression,
  downloadMidiFile,
  createChordObject,
  validateChordObject,
  formatDuration,
  calculateProgressionDuration,
  formatTime
};

export default chordProgressionService;