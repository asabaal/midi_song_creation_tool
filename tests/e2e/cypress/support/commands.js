// ***********************************************
// This file defines custom commands for the MIDI Song Creation Tool
// For more comprehensive examples, check out:
// https://on.cypress.io/custom-commands
// ***********************************************

// Create a new MIDI session
Cypress.Commands.add('createSession', (sessionName = 'Test Session') => {
  cy.visit('/');
  cy.get('[data-cy=new-session-button]').click();
  cy.get('[data-cy=session-name-input]').type(sessionName);
  cy.get('[data-cy=create-session-confirm]').click();
  cy.get('[data-cy=session-title]').should('contain', sessionName);
});

// Generate a chord progression
Cypress.Commands.add('generateChordProgression', (key = 'C', mode = 'major', progression = 'I-IV-V-I') => {
  cy.get('[data-cy=pattern-generator-tab]').click();
  cy.get('[data-cy=pattern-type-select]').select('chordProgression');
  cy.get('[data-cy=key-select]').select(key);
  cy.get('[data-cy=mode-select]').select(mode);
  cy.get('[data-cy=progression-input]').type('{selectall}' + progression);
  cy.get('[data-cy=generate-pattern-button]').click();
  cy.get('[data-cy=pattern-result]').should('exist');
});

// Generate a drum pattern
Cypress.Commands.add('generateDrumPattern', (bars = 2, style = 'basic') => {
  cy.get('[data-cy=pattern-generator-tab]').click();
  cy.get('[data-cy=pattern-type-select]').select('drumPattern');
  cy.get('[data-cy=bars-input]').clear().type(bars);
  cy.get('[data-cy=style-select]').select(style);
  cy.get('[data-cy=generate-pattern-button]').click();
  cy.get('[data-cy=pattern-result]').should('exist');
});

// Add a note to the piano roll
Cypress.Commands.add('addPianoRollNote', (pitch, time, duration = 1) => {
  cy.get('[data-cy=piano-roll]').should('be.visible');
  cy.get('[data-cy=piano-roll-grid]').then($grid => {
    // Calculate position based on pitch and time
    const cellHeight = $grid.height() / 88; // 88 keys on piano
    const cellWidth = $grid.width() / 16; // Assuming 16 time divisions are visible
    
    const y = $grid.height() - (pitch - 21) * cellHeight - (cellHeight / 2);
    const x = time * cellWidth + (cellWidth / 2);
    
    // Click to add note
    cy.wrap($grid).click(x, y);
    
    // If duration > 1, drag to extend the note
    if (duration > 1) {
      cy.get('[data-cy=note-resize-handle]').last().then($handle => {
        const resizeX = x + (duration - 1) * cellWidth;
        cy.wrap($handle).trigger('mousedown', { button: 0 })
          .trigger('mousemove', { clientX: resizeX })
          .trigger('mouseup');
      });
    }
  });
});

// Save the current project
Cypress.Commands.add('saveProject', (expectedMessage = 'Project saved successfully') => {
  cy.get('[data-cy=save-button]').click();
  cy.get('[data-cy=toast-message]').should('contain', expectedMessage);
});

// Export MIDI file
Cypress.Commands.add('exportMidi', () => {
  cy.get('[data-cy=export-button]').click();
  cy.get('[data-cy=export-midi-option]').click();
  // Since we can't test downloads directly in Cypress, we'll check that the export dialog appeared
  cy.get('[data-cy=export-dialog]').should('be.visible');
  cy.get('[data-cy=export-confirm-button]').click();
});

// Login as testing user (for authenticated operations)
Cypress.Commands.add('loginAsTestUser', () => {
  cy.session('testUser', () => {
    cy.visit('/login');
    cy.get('[data-cy=username-input]').type('test-user');
    cy.get('[data-cy=password-input]').type('test-password');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('not.include', '/login');
  });
});
