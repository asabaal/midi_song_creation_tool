// tests/e2e/cypress/specs/full-song-workflow.cy.js

describe('Full Song Creation Workflow', () => {
  it('should allow creating a complete song from scratch', () => {
    // Create a new session
    cy.createSession('Complete Song Workflow Test');
    
    // Step 1: Generate a chord progression
    cy.log('Generating chord progression');
    cy.generateChordProgression('C', 'major', 'I-vi-IV-V');
    
    // Verify chord progression was created and apply it
    cy.get('[data-cy=pattern-result]').should('be.visible');
    cy.get('[data-cy=apply-pattern-button]').click();
    
    // Verify the chord track was created
    cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 1);
    
    // Step 2: Generate a bassline
    cy.log('Generating bassline');
    cy.get('[data-cy=pattern-generator-tab]').click();
    cy.get('[data-cy=pattern-type-select]').select('bassline');
    cy.get('[data-cy=bassline-style-select]').select('walking');
    cy.get('[data-cy=generate-pattern-button]').click();
    
    // Apply bassline
    cy.get('[data-cy=apply-pattern-button]').click();
    
    // Verify bassline track was created
    cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 2);
    
    // Step 3: Generate a drum pattern
    cy.log('Generating drum pattern');
    cy.generateDrumPattern(4, 'pop');
    
    // Apply drum pattern
    cy.get('[data-cy=apply-pattern-button]').click();
    
    // Verify drum track was created
    cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 3);
    
    // Step 4: Go to piano roll to add a melody
    cy.log('Adding melody in piano roll');
    cy.get('[data-cy=piano-roll-tab]').click();
    
    // Add a new melody track
    cy.get('[data-cy=add-track-button]').click();
    cy.get('[data-cy=track-name-input]').type('Melody');
    cy.get('[data-cy=instrument-select]').select('Lead');
    cy.get('[data-cy=create-track-confirm]').click();
    
    // Select the melody track
    cy.get('[data-cy=track-list] [data-cy=track-item]').contains('Melody').click();
    
    // Add some melody notes (simplified - in real test would add more notes)
    cy.addPianoRollNote(72, 0, 1); // C5 at time 0, duration 1
    cy.addPianoRollNote(74, 1, 1); // D5 at time 1
    cy.addPianoRollNote(76, 2, 2); // E5 at time 2, duration 2
    cy.addPianoRollNote(77, 4, 1); // F5 at time 4
    cy.addPianoRollNote(79, 5, 3); // G5 at time 5, duration 3
    
    // Step 5: Adjust mixer settings
    cy.log('Adjusting mixer settings');
    cy.get('[data-cy=mixer-tab]').click();
    
    // Adjust volume of tracks
    cy.get('[data-cy=mixer-channel]').eq(0).within(() => {
      cy.get('[data-cy=volume-slider]').invoke('val', 80).trigger('input');
    });
    
    cy.get('[data-cy=mixer-channel]').eq(1).within(() => {
      cy.get('[data-cy=volume-slider]').invoke('val', 70).trigger('input');
    });
    
    // Add reverb to melody
    cy.get('[data-cy=mixer-channel]').eq(3).within(() => {
      cy.get('[data-cy=effects-button]').click();
      cy.get('[data-cy=add-effect-button]').click();
      cy.get('[data-cy=effect-type-select]').select('reverb');
      cy.get('[data-cy=effect-param-slider]').first().invoke('val', 30).trigger('input');
      cy.get('[data-cy=apply-effect-button]').click();
    });
    
    // Step 6: Play back the song
    cy.log('Playing back composition');
    cy.get('[data-cy=transport-tab]').click();
    cy.get('[data-cy=play-button]').click();
    
    // Wait for song to play for a bit
    cy.wait(2000);
    
    // Stop playback
    cy.get('[data-cy=stop-button]').click();
    
    // Step 7: Save the project
    cy.log('Saving project');
    cy.saveProject();
    
    // Step 8: Export as MIDI
    cy.log('Exporting as MIDI');
    cy.exportMidi();
    
    // Verify export dialog closed successfully
    cy.get('[data-cy=export-dialog]').should('not.exist');
    
    // Step 9: Verify project completion status
    cy.get('[data-cy=project-status]').should('contain', 'Complete');
  });
  
  it('should allow loading and modifying an existing template', () => {
    // Visit the app
    cy.visit('/');
    
    // Choose to use a template
    cy.get('[data-cy=use-template-button]').click();
    
    // Select the "Pop Ballad" template
    cy.get('[data-cy=template-list]').contains('Pop Ballad').click();
    cy.get('[data-cy=use-selected-template]').click();
    
    // Verify template loaded with tracks
    cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 4);
    
    // Modify the chord progression
    cy.get('[data-cy=pattern-generator-tab]').click();
    cy.get('[data-cy=pattern-type-select]').select('chordProgression');
    cy.get('[data-cy=existing-progression-select]').select('Chord Track');
    cy.get('[data-cy=edit-progression-button]').click();
    
    // Change key to G major
    cy.get('[data-cy=key-select]').select('G');
    cy.get('[data-cy=update-pattern-button]').click();
    cy.get('[data-cy=apply-pattern-button]').click();
    
    // Verify chord track was updated
    cy.get('[data-cy=track-list] [data-cy=track-item]').contains('Chords').should('exist');
    
    // Add a new melody part using virtual keyboard recording
    cy.get('[data-cy=keyboard-tab]').click();
    
    // Create a new track for the melody
    cy.get('[data-cy=add-track-button]').click();
    cy.get('[data-cy=track-name-input]').type('Added Melody');
    cy.get('[data-cy=instrument-select]').select('Synth Lead');
    cy.get('[data-cy=create-track-confirm]').click();
    
    // Record some notes (mocked for test)
    cy.get('[data-cy=record-button]').click();
    
    // Mock playing some keys
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(7).click(); // G4
    cy.wait(300);
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(9).click(); // A4
    cy.wait(300);
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(11).click(); // B4
    cy.wait(300);
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(12).click(); // C5
    
    // Stop recording
    cy.get('[data-cy=stop-button]').click();
    
    // Verify the new notes were added
    cy.get('[data-cy=piano-roll-tab]').click();
    cy.get('[data-cy=track-list] [data-cy=track-item]').contains('Added Melody').click();
    cy.get('[data-cy=piano-roll-note]').should('have.length.at.least', 4);
    
    // Save the modified project with a new name
    cy.get('[data-cy=save-button]').click();
    cy.get('[data-cy=save-as-button]').click();
    cy.get('[data-cy=project-name-input]').type('Modified Template');
    cy.get('[data-cy=save-confirm-button]').click();
    
    // Verify save confirmation
    cy.get('[data-cy=toast-message]').should('contain', 'Project saved successfully');
  });
});
