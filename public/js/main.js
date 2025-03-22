// Main JavaScript for MIDI Song Creation Tool

// DOM loaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('MIDI Song Creation Tool initialized');
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Create a session
    createSession()
        .then(session => {
            console.log('Session created:', session);
            // Use the session
        })
        .catch(error => {
            console.error('Error creating session:', error);
        });
}

/**
 * Create a new session
 * @returns {Promise<Object>} Created session
 */
function createSession() {
    return fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'New Session',
            bpm: 120,
            timeSignature: [4, 4]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create session');
        }
        return response.json();
    });
}
