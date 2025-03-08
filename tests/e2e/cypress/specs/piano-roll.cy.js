// tests/e2e/cypress/specs/piano-roll.cy.js
describe('Piano Roll Editor', () => {
  beforeEach(() => {
    // Create a test session via API
    cy.request({
      method: 'POST',
      url: '/api/sessions',
      body: {
        name: 'E2E Piano Roll Test',
        bpm: 120,
        timeSignature: [4, 4]
      }
    }).then(response => {
      // Store the session ID
      const sessionId = response.body.id;
      
      // Visit the editor for this session
      cy.visit(`/editor/${sessionId}`);
      
      // Intercept API calls
      cy.intercept('POST', `/api/sessions/${sessionId}/notes`).as('addNote');
      cy.intercept('PUT', `/api/sessions/${sessionId}/notes/*`).as('updateNote');
      cy.intercept('DELETE', `/api/sessions/${sessionId}/notes/*`).as('deleteNote');
    });
  });
  
  it('should add a note to the piano roll', () => {
    // Wait for the piano roll to fully load
    cy.get('[data-cy=piano-roll]').should('be.visible');
    
    // Click on the piano roll to add a note
    cy.get('[data-cy=note-grid]').click(200, 100);
    
    // Wait for the API call to complete
    cy.wait('@addNote').its('response.statusCode').should('eq', 201);
    
    // Verify the note appears in the UI
    cy.get('[data-cy=note]').should('have.length.at.least', 1);
  });
  
  it('should select and move a note', () => {
    // First add a note to work with
    cy.get('[data-cy=note-grid]').click(200, 100);
    cy.wait('@addNote');
    
    // Select the note
    cy.get('[data-cy=note]').first().click();
    
    // Move the note using keyboard
    cy.get('body').type('{rightarrow}'); // Move right
    
    // Wait for the update API call
    cy.wait('@updateNote').its('response.statusCode').should('eq', 200);
  });
  
  it('should resize a note', () => {
    // First add a note to work with
    cy.get('[data-cy=note-grid]').click(200, 100);
    cy.wait('@addNote');
    
    // Select the note
    cy.get('[data-cy=note]').first().click();
    
    // Click and drag the right edge of the note
    cy.get('[data-cy=note-resize-handle]').first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 300 })
      .trigger('mouseup');
    
    // Wait for the update API call
    cy.wait('@updateNote').its('response.statusCode').should('eq', 200);
  });
  
  it('should delete a note', () => {
    // First add a note to work with
    cy.get('[data-cy=note-grid]').click(200, 100);
    cy.wait('@addNote');
    
    // Get the initial note count
    cy.get('[data-cy=note]').then($notes => {
      const initialCount = $notes.length;
      
      // Select the note
      cy.get('[data-cy=note]').first().click();
      
      // Delete using keyboard
      cy.get('body').type('{del}');
      
      // Wait for the delete API call
      cy.wait('@deleteNote').its('response.statusCode').should('eq', 204);
      
      // Verify the note was removed
      cy.get('[data-cy=note]').should('have.length', initialCount - 1);
    });
  });
  
  it('should use quantization', () => {
    // Set quantize value
    cy.get('[data-cy=quantize-select]').select('0.25'); // 16th note
    
    // Add a note
    cy.get('[data-cy=note-grid]').click(205, 100); // Click at non-quantized position
    
    // Wait for the API call
    cy.wait('@addNote').then(interception => {
      // The startTime should be quantized to a 16th note grid
      const startTime = interception.request.body.startTime;
      
      // Verify the note position was quantized (should be multiple of 0.25)
      expect(startTime % 0.25).to.be.closeTo(0, 0.001);
    });
  });
  
  it('should change zoom level', () => {
    // Get the initial width of a measure
    cy.get('[data-cy=measure]').first().invoke('width').then(initialWidth => {
      // Click zoom in button
      cy.get('[data-cy=zoom-in-button]').click();
      
      // Verify the measure is now wider
      cy.get('[data-cy=measure]').first().invoke('width').should('be.gt', initialWidth);
      
      // Click zoom out button twice to zoom out
      cy.get('[data-cy=zoom-out-button]').click().click();
      
      // Verify the measure is now narrower
      cy.get('[data-cy=measure]').first().invoke('width').should('be.lt', initialWidth);
    });
  });
  
  it('should show piano keys and allow clicking them', () => {
    // Check that piano keys are visible
    cy.get('[data-cy=piano-key]').should('have.length.at.least', 12);
    
    // Click on a piano key to preview the sound
    cy.get('[data-cy=piano-key]').eq(5).click();
    
    // Audio preview is hard to test, so we'll just check the key got the active class
    cy.get('[data-cy=piano-key]').eq(5).should('have.class', 'active');
  });
});