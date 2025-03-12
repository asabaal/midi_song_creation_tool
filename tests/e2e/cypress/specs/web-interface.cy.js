// tests/e2e/cypress/specs/web-interface.cy.js
describe('Web Interface Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Setup network interception
    cy.intercept('POST', '/api/sessions').as('createSession');
    cy.intercept('POST', '/api/patterns/chord-progression').as('generateChords');
    cy.intercept('POST', '/api/patterns/bassline').as('generateBassline');
    cy.intercept('POST', '/api/patterns/drums').as('generateDrums');
    cy.intercept('DELETE', '/api/patterns/notes/*').as('clearNotes');
  });
  
  it('should set up a new session', () => {
    // Click on "Set Up" button
    cy.get('#setupBtn').click();
    
    // Wait for session to be created
    cy.wait('@createSession');
    
    // Check if the status was updated
    cy.get('#setupStatus').should('not.contain', 'Not set up yet');
    
    // Check if pattern buttons got enabled
    cy.get('#chordBtn').should('not.be.disabled');
    cy.get('#bassBtn').should('not.be.disabled');
    cy.get('#drumBtn').should('not.be.disabled');
    cy.get('#clearBtn').should('not.be.disabled');
  });
  
  it('should generate chord progression', () => {
    // Set up a session first
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    
    // Generate chord progression
    cy.get('#chordBtn').click();
    cy.wait('@generateChords');
    
    // Check if the piano roll shows notes
    cy.get('.piano-note').should('exist');
    
    // Check if play button is enabled
    cy.get('#playBtn').should('not.be.disabled');
    
    // Check if status shows note count
    cy.get('#playStatus').should('contain', 'notes ready to play');
  });
  
  it('should generate bassline', () => {
    // Set up a session first
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    
    // Generate bassline
    cy.get('#bassBtn').click();
    cy.wait('@generateBassline');
    
    // Check if the piano roll shows bassline notes
    cy.get('.piano-note.bassline-note').should('exist');
    
    // Check if play button is enabled
    cy.get('#playBtn').should('not.be.disabled');
  });
  
  it('should generate drums', () => {
    // Set up a session first
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    
    // Generate drums
    cy.get('#drumBtn').click();
    cy.wait('@generateDrums');
    
    // Check if the piano roll shows drum notes
    cy.get('.piano-note.drum-note').should('exist');
    
    // Check if play button is enabled
    cy.get('#playBtn').should('not.be.disabled');
  });
  
  it('should clear notes', () => {
    // Set up a session first
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    
    // Generate some notes
    cy.get('#chordBtn').click();
    cy.wait('@generateChords');
    
    // Check that notes exist
    cy.get('.piano-note').should('exist');
    
    // Clear the notes
    cy.get('#clearBtn').click();
    // Wait for clear operation to complete
    cy.wait(500);
    
    // Check that notes no longer exist
    cy.get('.piano-note').should('not.exist');
    
    // Check if play button is disabled
    cy.get('#playBtn').should('be.disabled');
  });
  
  it('should export and show JSON data', () => {
    // Set up a session and add notes
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    cy.get('#chordBtn').click();
    cy.wait('@generateChords');
    
    // Export as JSON
    cy.get('#exportJsonBtn').click();
    
    // Check if export area is shown
    cy.get('#exportArea').should('be.visible');
    
    // Check if JSON data is displayed
    cy.get('#exportText').should('not.be.empty');
  });
  
  it('should support copy to clipboard', () => {
    // Set up a session and add notes
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    cy.get('#chordBtn').click();
    cy.wait('@generateChords');
    
    // Export as JSON
    cy.get('#exportJsonBtn').click();
    
    // Mock clipboard write
    cy.window().then(win => {
      cy.stub(win.document, 'execCommand').returns(true);
    });
    
    // Click copy button
    cy.get('#copyJsonBtn').click();
    
    // Verify execCommand was called with 'copy'
    cy.window().then(win => {
      expect(win.document.execCommand).to.be.calledWith('copy');
    });
  });
  
  it('should open import interface', () => {
    // Set up a session first
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    
    // Click import button
    cy.get('#importBtn').click();
    
    // Check if import area is shown
    cy.get('#importArea').should('be.visible');
    
    // Check if text area exists
    cy.get('#importText').should('exist');
  });
  
  it('should play and stop audio', () => {
    // Set up a session and add notes
    cy.get('#setupBtn').click();
    cy.wait('@createSession');
    cy.get('#chordBtn').click();
    cy.wait('@generateChords');
    
    // Mock the AudioContext
    cy.window().then(win => {
      const mockContext = {
        currentTime: 0,
        createOscillator: () => ({
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: { value: 0 }
        }),
        createGain: () => ({
          connect: () => {},
          gain: { value: 0 }
        }),
        destination: {}
      };
      
      cy.stub(win, 'AudioContext').returns(mockContext);
      cy.stub(win, 'webkitAudioContext').returns(mockContext);
    });
    
    // Click play button
    cy.get('#playBtn').click();
    
    // Check if status shows playing
    cy.get('#playStatus').should('contain', 'Playing');
    
    // Click stop button
    cy.get('#stopBtn').click();
    
    // Check if status shows stopped
    cy.get('#playStatus').should('contain', 'ready to play');
  });
});
