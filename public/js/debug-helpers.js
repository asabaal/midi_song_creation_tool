/**
 * Debug helpers for the MIDI Song Creation Tool
 * This file adds debugging functionality to the main interface
 */

// Create debug container
function createDebugPanel() {
  const debugPanel = document.createElement('div');
  debugPanel.id = 'debugPanel';
  debugPanel.style.position = 'fixed';
  debugPanel.style.bottom = '40px';
  debugPanel.style.right = '10px';
  debugPanel.style.width = '300px';
  debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  debugPanel.style.color = '#fff';
  debugPanel.style.padding = '10px';
  debugPanel.style.borderRadius = '5px';
  debugPanel.style.zIndex = '9999';
  debugPanel.style.maxHeight = '300px';
  debugPanel.style.overflowY = 'auto';
  debugPanel.style.fontSize = '12px';
  debugPanel.style.fontFamily = 'monospace';
  
  // Add toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Debug Console';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.bottom = '10px';
  toggleBtn.style.right = '10px';
  toggleBtn.style.zIndex = '10000';
  toggleBtn.style.padding = '5px 10px';
  toggleBtn.style.backgroundColor = '#007bff';
  toggleBtn.style.color = '#fff';
  toggleBtn.style.border = 'none';
  toggleBtn.style.borderRadius = '3px';
  toggleBtn.style.cursor = 'pointer';
  
  toggleBtn.addEventListener('click', () => {
    if (debugPanel.style.display === 'none') {
      debugPanel.style.display = 'block';
      toggleBtn.textContent = 'Hide Debug';
    } else {
      debugPanel.style.display = 'none';
      toggleBtn.textContent = 'Debug Console';
    }
  });
  
  document.body.appendChild(toggleBtn);
  document.body.appendChild(debugPanel);
  
  // Initially hide
  debugPanel.style.display = 'none';
  
  return debugPanel;
}

// Add log to debug panel
function debugLog(message, type = 'info') {
  const debugPanel = document.getElementById('debugPanel') || createDebugPanel();
  
  const logEntry = document.createElement('div');
  logEntry.style.borderBottom = '1px solid #333';
  logEntry.style.padding = '5px 0';
  
  // Color based on type
  switch (type) {
    case 'error':
      logEntry.style.color = '#ff6b6b';
      break;
    case 'success':
      logEntry.style.color = '#51cf66';
      break;
    case 'warning':
      logEntry.style.color = '#fcc419';
      break;
    default:
      logEntry.style.color = '#fff';
  }
  
  const timestamp = new Date().toLocaleTimeString();
  logEntry.textContent = `[${timestamp}] ${message}`;
  
  debugPanel.appendChild(logEntry);
  debugPanel.scrollTop = debugPanel.scrollHeight;
  
  // Also log to console
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Add debugging to fetch requests
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Log outgoing requests
  debugLog(`Fetch: ${options?.method || 'GET'} ${url}`, 'info');
  
  if (options?.body) {
    try {
      const body = JSON.parse(options.body);
      debugLog(`Request body: ${JSON.stringify(body)}`, 'info');
    } catch (e) {
      debugLog(`Request body: [unparseable]`, 'warning');
    }
  }
  
  // Call original fetch
  return originalFetch.apply(this, arguments)
    .then(response => {
      // Clone response to avoid consuming it
      const clone = response.clone();
      
      // Log response status
      debugLog(`Response: ${response.status} ${response.statusText}`, 
        response.ok ? 'success' : 'error');
      
      // Try to parse and log JSON response
      clone.json().then(data => {
        debugLog(`Response data: ${JSON.stringify(data).substring(0, 100)}...`, 'info');
      }).catch(() => {
        debugLog('Response is not JSON', 'warning');
      });
      
      return response;
    })
    .catch(error => {
      debugLog(`Fetch error: ${error.message}`, 'error');
      throw error;
    });
};

// Fix for pattern generators
function patchPatternGenerators() {
  // Wait for DOM to be fully loaded
  if (document.readyState !== 'complete') {
    window.addEventListener('load', patchPatternGenerators);
    return;
  }
  
  debugLog('Patching pattern generators...', 'info');
  
  // Fix for chord progression generator
  const generateChordProgressionBtn = document.getElementById('generateChordProgressionBtn');
  if (generateChordProgressionBtn) {
    debugLog('Found chord progression button, adding debug handler', 'info');
    
    // Clone and replace to remove old event listeners
    const newBtn = generateChordProgressionBtn.cloneNode(true);
    generateChordProgressionBtn.parentNode.replaceChild(newBtn, generateChordProgressionBtn);
    
    newBtn.addEventListener('click', () => {
      debugLog('Chord progression button clicked', 'info');
      
      const key = document.getElementById('progressionKey')?.value || 'C';
      const progressionType = document.getElementById('progressionType')?.value || '1-4-5';
      const scaleType = document.getElementById('progressionScaleType')?.value || 'major';
      const octave = parseInt(document.getElementById('progressionOctave')?.value || '4');
      
      debugLog(`Generating chord progression: ${key} ${progressionType} ${scaleType} octave ${octave}`, 'info');
      
      // Direct API call bypassing any potential UI issues
      if (window.currentSessionId) {
        fetch(`/api/sessions/${window.currentSessionId}/patterns/chord-progression`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: key,
            progressionName: progressionType,
            scaleType: scaleType,
            octave: octave,
            rhythmPattern: [4]
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            debugLog(`Chord progression generated successfully with ${data.noteCount} notes`, 'success');
            
            // Force refresh of sequence list and piano roll
            if (typeof refreshSequenceList === 'function') {
              refreshSequenceList();
            }
            
            // Set current sequence and load it
            window.currentSequenceId = data.currentSequenceId;
            if (typeof loadSequence === 'function') {
              loadSequence(data.currentSequenceId);
            }
            
            document.querySelector('#piano-roll-tab').click();
          } else {
            debugLog(`Failed to generate chord progression: ${data.message}`, 'error');
          }
        })
        .catch(error => {
          debugLog(`Error generating chord progression: ${error.message}`, 'error');
        });
      } else {
        debugLog('No active session ID found. Creating session...', 'warning');
        
        // Create session first
        fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            debugLog(`Session created: ${data.sessionId}`, 'success');
            window.currentSessionId = data.sessionId;
            
            // Try again
            newBtn.click();
          } else {
            debugLog(`Failed to create session: ${data.message}`, 'error');
          }
        })
        .catch(error => {
          debugLog(`Error creating session: ${error.message}`, 'error');
        });
      }
    });
  } else {
    debugLog('Chord progression button not found', 'warning');
  }
  
  // Add similar fixes for other pattern generators
  // ...
}

// Initialize debugging tools
function initDebugTools() {
  debugLog('Debug tools initialized', 'success');
  
  // Check if UI is fully initialized
  if (document.getElementById('sequenceList')) {
    debugLog('UI seems to be initialized', 'info');
    
    // Check global state
    if (window.currentSessionId) {
      debugLog(`Active session ID: ${window.currentSessionId}`, 'info');
    } else {
      debugLog('No active session ID found', 'warning');
    }
    
    if (window.currentSequenceId) {
      debugLog(`Active sequence ID: ${window.currentSequenceId}`, 'info');
    } else {
      debugLog('No active sequence ID found', 'warning');
    }
  } else {
    debugLog('UI not fully initialized yet', 'warning');
  }
  
  // Add link to debug page
  const debugLink = document.createElement('a');
  debugLink.href = '/debug.html';
  debugLink.textContent = 'Debug Interface';
  debugLink.target = '_blank';
  debugLink.style.position = 'fixed';
  debugLink.style.top = '10px';
  debugLink.style.right = '10px';
  debugLink.style.zIndex = '10000';
  debugLink.style.padding = '5px 10px';
  debugLink.style.backgroundColor = '#007bff';
  debugLink.style.color = '#fff';
  debugLink.style.textDecoration = 'none';
  debugLink.style.borderRadius = '3px';
  document.body.appendChild(debugLink);
  
  // Apply patches
  patchPatternGenerators();
}

// Run on page load
document.addEventListener('DOMContentLoaded', initDebugTools);
