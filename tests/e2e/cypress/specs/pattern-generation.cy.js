// tests/e2e/cypress/specs/pattern-generation.cy.js
describe('Pattern Generation', () => {
  beforeEach(() => {
    // Create a test session via API
    cy.request({
      method: 'POST',
      url: '/api/sessions',
      body: {
        name: 'E2E Pattern Test',
        bpm: 120,
        timeSignature: [4, 4]
      }
    }).then(response => {
      // Store the session ID
      const sessionId = response.body.id;
      
      // Visit the editor for this session
      cy.visit(`/editor/${sessionId}`);
      
      // Open the pattern generator panel
      cy.get('[data-cy=pattern-generator-button]').click();
      
      // Intercept API calls
      cy.intercept('POST', `/api/sessions/${sessionId}/patterns`).as('generatePattern');
    });
  });
  
  it('should generate a chord pattern', () => {
    // Select the chord tab
    cy.get('[data-cy=chord-patterns-tab]').click();
    
    // Fill out the chord form
    cy.get('[data-cy=root-note-select]').select('C');
    cy.get('[data-cy=chord-type-select]').select('major');
    cy.get('[data-cy=octave-select]').select('4');
    
    // Click generate
    cy.get('[data-cy=generate-chord-button]').click();
    
    // Wait for the API call
    cy.wait('@generatePattern').its('response.statusCode').should('eq', 201);
    
    // Check that notes were added to the piano roll
    cy.get('[data-cy=note]').should('have.length.at.least', 3);
  });
  
  it('should generate a bassline pattern', () => {
    // Select the bassline tab
    cy.get('[data-cy=bassline-patterns-tab]').click();
    
    // Change to a bass track (typically track 1)
    cy.get('[data-cy=track-select]').select('1');
    
    // Fill out the bassline form
    cy.get('[data-cy=bassline-style-select]').select('walking');
    cy.get('[data-cy=chord-roots-input]').type('C G F C');
    cy.get('[data-cy=bassline-octave-select]').select('2');
    
    // Click generate
    cy.get('[data-cy=generate-bassline-button]').click();
    
    // Wait for the API call
    cy.wait('@generatePattern').its('response.statusCode').should('eq', 201);
    
    // Check that notes were added to the piano roll
    cy.get('[data-cy=note]').should('have.length.at.least', 4);
  });
  
  it('should generate a drum pattern', () => {
    // Select the drum tab
    cy.get('[data-cy=drum-patterns-tab]').click();
    
    // Change to the drum track (typically track 9)
    cy.get('[data-cy=track-select]').select('9');
    
    // Fill out the drum form
    cy.get('[data-cy=drum-style-select]').select('basic');
    cy.get('[data-cy=bars-input]').clear().type('2');
    
    // Click generate
    cy.get('[data-cy=generate-drum-button]').click();
    
    // Wait for the API call
    cy.wait('@generatePattern').its('response.statusCode').should('eq', 201);
    
    // Check that notes were added to the piano roll
    cy.get('[data-cy=note]').should('have.length.at.least', 8);
  });
  
  it('should show error message when pattern generation fails', () => {
    // Intercept and mock a failed generation
    cy.intercept('POST', '**/patterns', {
      statusCode: 500,
      body: { 
        error: 'Server error during pattern generation'
      }
    }).as('failedGeneration');
    
    // Select the chord tab
    cy.get('[data-cy=chord-patterns-tab]').click();
    
    // Fill out the chord form minimally
    cy.get('[data-cy=root-note-select]').select('C');
    
    // Click generate
    cy.get('[data-cy=generate-chord-button]').click();
    
    // Wait for the API call
    cy.wait('@failedGeneration');
    
    // Check that error message is shown
    cy.get('[data-cy=pattern-error-message]')
      .should('be.visible')
      .and('contain', 'Server error');
  });
  
  it('should preview pattern before adding it', () => {
    // Select the chord tab
    cy.get('[data-cy=chord-patterns-tab]').click();
    
    // Fill out the chord form
    cy.get('[data-cy=root-note-select]').select('C');
    cy.get('[data-cy=chord-type-select]').select('major');
    
    // Click preview instead of generate
    cy.get('[data-cy=preview-chord-button]').click();
    
    // Wait for the preview to load 
    cy.get('[data-cy=pattern-preview]').should('be.visible');
    
    // Verify preview shows the chord notes
    cy.get('[data-cy=preview-note]').should('have.length.at.least', 3);
    
    // Now click "Apply" to actually add the notes
    cy.get('[data-cy=apply-pattern-button]').click();
    
    // Wait for the API call
    cy.wait('@generatePattern').its('response.statusCode').should('eq', 201);
    
    // Check notes were added to the piano roll
    cy.get('[data-cy=note]').should('have.length.at.least', 3);
  });
});