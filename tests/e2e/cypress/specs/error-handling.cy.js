// tests/e2e/cypress/specs/error-handling.cy.js

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    cy.createSession('Error Handling Test');
  });
  
  it('should handle invalid chord progression input', () => {
    cy.get('[data-cy=pattern-generator-tab]').click();
    cy.get('[data-cy=pattern-type-select]').select('chordProgression');
    
    // Enter invalid progression with non-existent numerals
    cy.get('[data-cy=progression-input]').type('{selectall}I-VIII-Z-III');
    cy.get('[data-cy=generate-pattern-button]').click();
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=error-message]').should('contain', 'Invalid Roman numeral');
  });
  
  it('should handle invalid tempo values', () => {
    cy.get('[data-cy=transport-tab]').click();
    
    // Try to set tempo too low
    cy.get('[data-cy=tempo-input]').clear().type('10');
    cy.get('[data-cy=apply-tempo-button]').click();
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=error-message]').should('contain', 'Tempo must be between');
    
    // Try to set tempo too high
    cy.get('[data-cy=tempo-input]').clear().type('500');
    cy.get('[data-cy=apply-tempo-button]').click();
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('be.visible');
    
    // Valid tempo should work
    cy.get('[data-cy=tempo-input]').clear().type('120');
    cy.get('[data-cy=apply-tempo-button]').click();
    
    // No error message
    cy.get('[data-cy=error-message]').should('not.exist');
  });
  
  it('should handle MIDI file import errors', () => {
    // Mock a failed MIDI import
    cy.intercept('POST', '/api/import-midi', {
      statusCode: 400,
      body: {
        error: 'Invalid MIDI file format'
      }
    }).as('importMidi');
    
    // Try to import MIDI
    cy.get('[data-cy=file-menu-button]').click();
    cy.get('[data-cy=import-option]').click();
    cy.get('[data-cy=import-midi-option]').click();
    
    // Simulate file selection (mocked)
    cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/invalid.mid', { force: true });
    
    // Wait for error response
    cy.wait('@importMidi');
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=error-message]').should('contain', 'Invalid MIDI file format');
  });
  
  it('should handle connection errors gracefully', () => {
    // Mock a network error
    cy.intercept('GET', '/api/projects', {
      forceNetworkError: true
    }).as('loadProjects');
    
    // Try to load projects
    cy.get('[data-cy=file-menu-button]').click();
    cy.get('[data-cy=open-project-option]').click();
    
    // Wait for error
    cy.wait('@loadProjects');
    
    // Should show error message about connection
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=error-message]').should('contain', 'connection');
    
    // Should provide retry option
    cy.get('[data-cy=retry-button]').should('be.visible');
    
    // Restore connection and retry
    cy.intercept('GET', '/api/projects', {
      statusCode: 200,
      body: []
    }).as('loadProjectsRetry');
    
    cy.get('[data-cy=retry-button]').click();
    cy.wait('@loadProjectsRetry');
    
    // Should show projects list (even if empty)
    cy.get('[data-cy=projects-list]').should('be.visible');
  });
  
  it('should validate required fields in forms', () => {
    // Try to create a track without a name
    cy.get('[data-cy=add-track-button]').click();
    cy.get('[data-cy=track-name-input]').clear();
    cy.get('[data-cy=create-track-confirm]').click();
    
    // Should show validation error
    cy.get('[data-cy=validation-error]').should('be.visible');
    cy.get('[data-cy=validation-error]').should('contain', 'required');
    
    // Fill in the name and try again
    cy.get('[data-cy=track-name-input]').type('Valid Track Name');
    cy.get('[data-cy=create-track-confirm]').click();
    
    // Should create track successfully
    cy.get('[data-cy=track-list] [data-cy=track-item]').contains('Valid Track Name').should('exist');
  });
  
  it('should handle out-of-memory for large projects', () => {
    // Try to generate a very large pattern
    cy.get('[data-cy=pattern-generator-tab]').click();
    cy.get('[data-cy=pattern-type-select]').select('drumPattern');
    cy.get('[data-cy=bars-input]').clear().type('1000'); // Unreasonable number of bars
    cy.get('[data-cy=generate-pattern-button]').click();
    
    // Should show resource error
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=error-message]').should('contain', 'resource');
  });
  
  it('should handle rapid user interactions correctly', () => {
    // Simulate rapid button clicks
    for (let i = 0; i < 10; i++) {
      cy.get('[data-cy=add-track-button]').click();
      cy.get('[data-cy=cancel-button]').click();
    }
    
    // UI should remain responsive
    cy.get('[data-cy=add-track-button]').should('be.enabled');
    
    // Try pattern generation with rapid parameter changes
    cy.get('[data-cy=pattern-generator-tab]').click();
    cy.get('[data-cy=pattern-type-select]').select('chordProgression');
    
    // Rapidly change parameters
    const keys = ['C', 'D', 'E', 'F', 'G'];
    const modes = ['major', 'minor', 'dorian', 'mixolydian'];
    
    // Loop through combinations rapidly
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy=key-select]').select(keys[i % keys.length]);
      cy.get('[data-cy=mode-select]').select(modes[i % modes.length]);
    }
    
    // Should still be able to generate pattern
    cy.get('[data-cy=generate-pattern-button]').click();
    cy.get('[data-cy=pattern-result]').should('exist');
  });
  
  it('should handle browser refresh and maintain state', () => {
    // Create some content first
    cy.generateChordProgression('D', 'minor', 'i-iv-v-i');
    cy.get('[data-cy=apply-pattern-button]').click();
    
    // Save project
    cy.saveProject();
    
    // Refresh the page
    cy.reload();
    
    // Session should be restored
    cy.get('[data-cy=session-title]').should('contain', 'Error Handling Test');
    
    // Tracks should still exist
    cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 1);
  });
});
