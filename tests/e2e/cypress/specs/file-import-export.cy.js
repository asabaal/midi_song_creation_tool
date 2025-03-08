// tests/e2e/cypress/specs/file-import-export.cy.js

describe('File Import and Export Workflows', () => {
  beforeEach(() => {
    // Create a new session
    cy.createSession('File Import Export Test');
  });
  
  describe('MIDI File Export', () => {
    it('should export a basic MIDI file', () => {
      // Create a simple melody track
      cy.get('[data-cy=add-track-button]').click();
      cy.get('[data-cy=track-name-input]').type('Export Test Track');
      cy.get('[data-cy=instrument-select]').select('Piano');
      cy.get('[data-cy=create-track-confirm]').click();
      
      // Add some notes via piano roll
      cy.get('[data-cy=piano-roll-tab]').click();
      cy.addPianoRollNote(60, 0, 1); // C4
      cy.addPianoRollNote(62, 1, 1); // D4
      cy.addPianoRollNote(64, 2, 1); // E4
      cy.addPianoRollNote(65, 3, 1); // F4
      
      // Export as MIDI
      cy.get('[data-cy=file-menu-button]').click();
      cy.get('[data-cy=export-option]').click();
      cy.get('[data-cy=export-midi-option]').click();
      
      // Set filename in export dialog
      cy.get('[data-cy=export-filename-input]').type('cypress-test-export');
      
      // Mock the download since Cypress can't test actual downloads
      cy.window().then((win) => {
        cy.stub(win, 'saveAs').as('saveFile');
      });
      
      // Confirm export
      cy.get('[data-cy=export-confirm-button]').click();
      
      // Verify save was triggered
      cy.get('@saveFile').should('have.been.called');
      
      // Verify success message
      cy.get('[data-cy=toast-message]').should('contain', 'successfully');
    });
    
    it('should show export settings options', () => {
      // Create a simple track
      cy.get('[data-cy=add-track-button]').click();
      cy.get('[data-cy=track-name-input]').type('Settings Test Track');
      cy.get('[data-cy=create-track-confirm]').click();
      
      // Go to export
      cy.get('[data-cy=file-menu-button]').click();
      cy.get('[data-cy=export-option]').click();
      cy.get('[data-cy=export-midi-option]').click();
      
      // Check available settings
      cy.get('[data-cy=export-settings-button]').click();
      
      // Verify settings dialog opens
      cy.get('[data-cy=export-settings-dialog]').should('be.visible');
      
      // Verify key settings are present
      cy.get('[data-cy=midi-format-select]').should('exist');
      cy.get('[data-cy=include-tempo-checkbox]').should('exist');
      cy.get('[data-cy=include-time-signature-checkbox]').should('exist');
      
      // Change some settings
      cy.get('[data-cy=midi-format-select]').select('1'); // MIDI format 1
      cy.get('[data-cy=include-program-changes-checkbox]').check();
      
      // Save settings
      cy.get('[data-cy=save-settings-button]').click();
      
      // Verify settings dialog closed
      cy.get('[data-cy=export-settings-dialog]').should('not.exist');
      
      // Confirm export (mock the download)
      cy.window().then((win) => {
        cy.stub(win, 'saveAs').as('saveFile');
      });
      
      cy.get('[data-cy=export-confirm-button]').click();
      
      // Verify save was triggered
      cy.get('@saveFile').should('have.been.called');
    });
    
    it('should handle export cancellation', () => {
      // Create a simple track
      cy.get('[data-cy=add-track-button]').click();
      cy.get('[data-cy=track-name-input]').type('Cancel Test Track');
      cy.get('[data-cy=create-track-confirm]').click();
      
      // Go to export
      cy.get('[data-cy=file-menu-button]').click();
      cy.get('[data-cy=export-option]').click();
      cy.get('[data-cy=export-midi-option]').click();
      
      // Click cancel
      cy.get('[data-cy=export-cancel-button]').click();
      
      // Verify dialog closed
      cy.get('[data-cy=export-dialog]').should('not.exist');
      
      // Verify we're still in the application
      cy.get('[data-cy=track-list]').should('be.visible');
    });
  });
  
  describe('MIDI File Import', () => {
    it('should import a MIDI file', () => {
      // Mock the file selection
      cy.fixture('test-midi-file.mid', 'binary').then(fileContent => {
        // Create a mock File object
        const testFile = new File([fileContent], 'test-midi-file.mid', { type: 'audio/midi' });
        
        // Override the native input click handler to set our file
        cy.get('[data-cy=file-menu-button]').click();
        cy.get('[data-cy=import-option]').click();
        cy.get('[data-cy=import-midi-option]').click();
        
        cy.get('[data-cy=file-input]').then($input => {
          // Programmatically set the file in the input element
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(testFile);
          $input[0].files = dataTransfer.files;
          $input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      
      // Verify import was successful
      cy.get('[data-cy=import-progress-dialog]').should('be.visible');
      cy.get('[data-cy=import-progress-dialog]').should('contain', 'Processing');
      
      // Wait for import to complete
      cy.get('[data-cy=import-progress-dialog]', { timeout: 10000 }).should('not.exist');
      
      // Verify tracks were created from the import
      cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 1);
      
      // Verify the piano roll shows notes
      cy.get('[data-cy=piano-roll-tab]').click();
      cy.get('[data-cy=piano-roll-note]').should('exist');
    });
    
    it('should handle import errors gracefully', () => {
      // Create an invalid mock MIDI file (just random data)
      const invalidFileContent = new Uint8Array([0, 1, 2, 3, 4, 5]);
      const invalidFile = new File([invalidFileContent], 'invalid.mid', { type: 'audio/midi' });
      
      // Attempt to import
      cy.get('[data-cy=file-menu-button]').click();
      cy.get('[data-cy=import-option]').click();
      cy.get('[data-cy=import-midi-option]').click();
      
      cy.get('[data-cy=file-input]').then($input => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(invalidFile);
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Verify error message is shown
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=error-message]').should('contain', 'invalid');
      
      // Verify we can dismiss the error and continue
      cy.get('[data-cy=error-close-button]').click();
      cy.get('[data-cy=error-message]').should('not.exist');
      
      // Verify application is still usable
      cy.get('[data-cy=track-list]').should('be.visible');
    });
    
    it('should provide import options', () => {
      // Mock a file selection
      cy.fixture('test-midi-file.mid', 'binary').then(fileContent => {
        const testFile = new File([fileContent], 'test-midi-file.mid', { type: 'audio/midi' });
        
        cy.get('[data-cy=file-menu-button]').click();
        cy.get('[data-cy=import-option]').click();
        cy.get('[data-cy=import-midi-option]').click();
        
        cy.get('[data-cy=file-input]').then($input => {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(testFile);
          $input[0].files = dataTransfer.files;
          $input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      
      // Check for import options before processing
      cy.get('[data-cy=import-options-dialog]').should('be.visible');
      
      // Verify key import options
      cy.get('[data-cy=merge-with-current-checkbox]').should('exist');
      cy.get('[data-cy=track-filtering-options]').should('exist');
      
      // Select options and continue
      cy.get('[data-cy=merge-with-current-checkbox]').check();
      cy.get('[data-cy=import-options-continue]').click();
      
      // Wait for import to complete
      cy.get('[data-cy=import-progress-dialog]', { timeout: 10000 }).should('not.exist');
      
      // Verify tracks were added
      cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length.at.least', 1);
    });
  });
  
  describe('Project Save/Load', () => {
    it('should save and load project files', () => {
      // Create some content
      cy.get('[data-cy=add-track-button]').click();
      cy.get('[data-cy=track-name-input]').type('Save Load Test Track');
      cy.get('[data-cy=create-track-confirm]').click();
      
      // Add some notes
      cy.get('[data-cy=piano-roll-tab]').click();
      cy.addPianoRollNote(60, 0, 1);
      cy.addPianoRollNote(62, 1, 1);
      
      // Save project (mock the download)
      cy.window().then((win) => {
        cy.stub(win, 'saveAs').as('saveProject');
      });
      
      cy.get('[data-cy=file-menu-button]').click();
      cy.get('[data-cy=save-as-option]').click();
      cy.get('[data-cy=save-filename-input]').type('test-project');
      cy.get('[data-cy=save-confirm-button]').click();
      
      // Verify save occurred
      cy.get('@saveProject').should('have.been.called');
      
      // Now create a new session
      cy.get('[data-cy=file-menu-button]').click();
      cy.get('[data-cy=new-session-option]').click();
      cy.get('[data-cy=session-name-input]').type('Empty Session');
      cy.get('[data-cy=create-session-confirm]').click();
      
      // Verify we have an empty session
      cy.get('[data-cy=track-list] [data-cy=track-item]').should('not.exist');
      
      // Now load the saved project
      cy.fixture('test-project.msct', 'binary').then(fileContent => {
        // Create a mock project file
        const projectFile = new File([fileContent], 'test-project.msct', { type: 'application/json' });
        
        cy.get('[data-cy=file-menu-button]').click();
        cy.get('[data-cy=open-option]').click();
        
        cy.get('[data-cy=project-file-input]').then($input => {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(projectFile);
          $input[0].files = dataTransfer.files;
          $input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      
      // Verify project loaded
      cy.get('[data-cy=track-list] [data-cy=track-item]').should('have.length', 1);
      cy.get('[data-cy=track-list] [data-cy=track-item]').should('contain', 'Save Load Test Track');
      
      // Verify notes are present
      cy.get('[data-cy=piano-roll-tab]').click();
      cy.get('[data-cy=piano-roll-note]').should('have.length', 2);
    });
  });
});
