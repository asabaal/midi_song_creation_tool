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
 * Generate a chord pattern locally (for preview or offline use)
 * @private
 */
function generateChordPattern(params) {
  const { root, chordType, octave } = params;
  
  // Map chord types to note intervals
  const chordIntervals = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7]
  };
  
  // Map note names to MIDI numbers for octave 0
  const noteToMidi = {
    'C': 12, 'C#': 13, 'D': 14, 'D#': 15, 'E': 16, 'F': 17,
    'F#': 18, 'G': 19, 'G#': 20, 'A': 21, 'A#': 22, 'B': 23
  };
  
  // Calculate root note MIDI number
  const rootMidi = noteToMidi[root] + (octave * 12);
  
  // Generate the chord notes
  const intervals = chordIntervals[chordType] || chordIntervals.major;
  const notes = intervals.map(interval => ({
    id: `note-${Date.now()}-${interval}`,
    pitch: rootMidi + interval,
    startTime: 0,
    duration: 1,
    velocity: 100
  }));
  
  return {
    notes,
    type: 'chord',
    root,
    chordType
  };
}

/**
 * Generate a bassline pattern locally (for preview or offline use)
 * @private
 */
function generateBasslinePattern(params) {
  const { style, roots = ['C'], octave = 2 } = params;
  
  // Map note names to MIDI numbers for octave 0
  const noteToMidi = {
    'C': 12, 'C#': 13, 'D': 14, 'D#': 15, 'E': 16, 'F': 17,
    'F#': 18, 'G': 19, 'G#': 20, 'A': 21, 'A#': 22, 'B': 23
  };
  
  let rootNotes = Array.isArray(roots) ? roots : [roots];
  if (typeof roots === 'string') {
    rootNotes = roots.split(/\s+/);
  }
  
  const notes = [];
  const noteVelocities = [100, 90, 95, 85];
  
  rootNotes.forEach((root, i) => {
    const rootMidi = noteToMidi[root] + (octave * 12);
    
    if (style === 'walking') {
      // Walking bassline pattern: root, 5th, octave, chromatic approach
      notes.push({
        id: `note-${Date.now()}-${i}-0`,
        pitch: rootMidi,
        startTime: i * 4,
        duration: 1,
        velocity: noteVelocities[0]
      });
      
      notes.push({
        id: `note-${Date.now()}-${i}-1`,
        pitch: rootMidi + 7,
        startTime: i * 4 + 1,
        duration: 1,
        velocity: noteVelocities[1]
      });
      
      notes.push({
        id: `note-${Date.now()}-${i}-2`,
        pitch: rootMidi + 12,
        startTime: i * 4 + 2,
        duration: 1,
        velocity: noteVelocities[2]
      });
      
      notes.push({
        id: `note-${Date.now()}-${i}-3`,
        pitch: rootMidi + 11,
        startTime: i * 4 + 3,
        duration: 1,
        velocity: noteVelocities[3]
      });
    } else {
      // Default pattern: just the root notes
      notes.push({
        id: `note-${Date.now()}-${i}`,
        pitch: rootMidi,
        startTime: i,
        duration: 1,
        velocity: 100
      });
    }
  });
  
  return {
    notes,
    type: 'bassline',
    style
  };
}

/**
 * Generate a drum pattern locally (for preview or offline use)
 * @private
 */
function generateDrumPattern(params) {
  const { style, bars = 2, fill = false } = params;
  
  // MIDI drum map
  const drums = {
    kick: 36,
    snare: 38,
    hihatClosed: 42,
    hihatOpen: 46,
    ride: 51,
    crash: 49
  };
  
  const notes = [];
  
  if (style === 'basic' || style === 'rock') {
    // Basic rock pattern: Kick on 1 & 3, Snare on 2 & 4, Hi-hat on 8ths
    for (let bar = 0; bar < bars; bar++) {
      // Kick drum on beats 1 and 3
      notes.push({
        id: `note-${Date.now()}-kick-${bar}-1`,
        pitch: drums.kick,
        startTime: bar * 4 + 0,
        duration: 0.25,
        velocity: 100
      });
      
      notes.push({
        id: `note-${Date.now()}-kick-${bar}-3`,
        pitch: drums.kick,
        startTime: bar * 4 + 2,
        duration: 0.25,
        velocity: 95
      });
      
      // Snare on beats 2 and 4
      notes.push({
        id: `note-${Date.now()}-snare-${bar}-2`,
        pitch: drums.snare,
        startTime: bar * 4 + 1,
        duration: 0.25,
        velocity: 90
      });
      
      notes.push({
        id: `note-${Date.now()}-snare-${bar}-4`,
        pitch: drums.snare,
        startTime: bar * 4 + 3,
        duration: 0.25,
        velocity: 90
      });
      
      // Hi-hat on every 8th note
      for (let i = 0; i < 8; i++) {
        notes.push({
          id: `note-${Date.now()}-hihat-${bar}-${i}`,
          pitch: drums.hihatClosed,
          startTime: bar * 4 + i * 0.5,
          duration: 0.25,
          velocity: 80
        });
      }
    }
    
    // Add a fill in the last bar if requested
    if (fill && bars > 0) {
      // Remove the last snare hit
      notes.pop();
      
      // Add crash on the first beat of the next bar
      notes.push({
        id: `note-${Date.now()}-crash-fill`,
        pitch: drums.crash,
        startTime: bars * 4,
        duration: 0.5,
        velocity: 100
      });
      
      // Add snare fill in the last beat
      for (let i = 0; i < 4; i++) {
        notes.push({
          id: `note-${Date.now()}-snare-fill-${i}`,
          pitch: drums.snare,
          startTime: bars * 4 - 1 + i * 0.25,
          duration: 0.25,
          velocity: 70 + i * 10
        });
      }
    }
  } else {
    // Just add a simple pattern for other styles
    for (let bar = 0; bar < bars; bar++) {
      notes.push({
        id: `note-${Date.now()}-kick-${bar}`,
        pitch: drums.kick,
        startTime: bar * 4,
        duration: 0.25,
        velocity: 100
      });
      
      notes.push({
        id: `note-${Date.now()}-snare-${bar}`,
        pitch: drums.snare,
        startTime: bar * 4 + 2,
        duration: 0.25,
        velocity: 90
      });
    }
  }
  
  return {
    notes,
    type: 'drum',
    style
  };
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
