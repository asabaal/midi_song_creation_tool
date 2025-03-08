// tests/e2e/cypress/specs/create-session.cy.js
describe('Create New Session', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
    
    // Intercept API requests for sessions
    cy.intercept('GET', '/api/sessions').as('getSessions');
    cy.intercept('POST', '/api/sessions').as('createSession');
  });
  
  it('should create a new session', () => {
    // Wait for the initial sessions to load
    cy.wait('@getSessions');
    
    // Click the "New Session" button
    cy.get('[data-cy=new-session-button]').click();
    
    // Fill out the new session form
    cy.get('[data-cy=session-name-input]').type('My E2E Test Session');
    cy.get('[data-cy=session-bpm-input]').clear().type('130');
    cy.get('[data-cy=session-time-signature]').select('4/4');
    
    // Submit the form
    cy.get('[data-cy=create-session-submit]').click();
    
    // Wait for the session to be created
    cy.wait('@createSession').its('response.statusCode').should('eq', 201);
    
    // Verify we were redirected to the editor page
    cy.url().should('include', '/editor');
    
    // Verify session name appears in the UI
    cy.get('[data-cy=current-session-name]').should('contain', 'My E2E Test Session');
    
    // Verify the transport panel shows the correct BPM
    cy.get('[data-cy=bpm-display]').should('contain', '130');
  });
  
  it('should validate form inputs', () => {
    // Wait for the initial sessions to load
    cy.wait('@getSessions');
    
    // Click the "New Session" button
    cy.get('[data-cy=new-session-button]').click();
    
    // Try to submit without a name
    cy.get('[data-cy=create-session-submit]').click();
    
    // Verify validation error appears
    cy.get('[data-cy=session-name-error]').should('be.visible');
    
    // Fill out the name field
    cy.get('[data-cy=session-name-input]').type('Valid Name');
    
    // Try to submit with an invalid BPM
    cy.get('[data-cy=session-bpm-input]').clear().type('300');
    cy.get('[data-cy=create-session-submit]').click();
    
    // Verify validation error appears
    cy.get('[data-cy=session-bpm-error]').should('be.visible');
    
    // No session should be created yet
    cy.get('@createSession.all').should('have.length', 0);
  });
  
  it('should cancel session creation', () => {
    // Wait for the initial sessions to load
    cy.wait('@getSessions');
    
    // Click the "New Session" button
    cy.get('[data-cy=new-session-button]').click();
    
    // Fill out some form data
    cy.get('[data-cy=session-name-input]').type('Session to Cancel');
    
    // Click the cancel button
    cy.get('[data-cy=create-session-cancel]').click();
    
    // Verify we're back on the home page
    cy.url().should('not.include', '/create');
    
    // No session should be created
    cy.get('@createSession.all').should('have.length', 0);
  });
});