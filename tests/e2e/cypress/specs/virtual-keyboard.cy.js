// tests/e2e/cypress/specs/virtual-keyboard.cy.js

describe('Virtual Keyboard Interaction', () => {
  beforeEach(() => {
    // Create a new session before each test
    cy.createSession('Keyboard Test Session');
    
    // Navigate to the keyboard view
    cy.get('[data-cy=keyboard-tab]').click();
    cy.get('[data-cy=virtual-keyboard]').should('be.visible');
  });
  
  it('should display the virtual keyboard with correct number of keys', () => {
    // Default keyboard has 2 octaves = 24 keys (14 white, 10 black)
    cy.get('[data-cy=virtual-keyboard] .white-key').should('have.length', 14);
    cy.get('[data-cy=virtual-keyboard] .black-key').should('have.length', 10);
  });
  
  it('should allow changing octave range', () => {
    // Change to 3 octaves
    cy.get('[data-cy=octave-range-select]').select('3');
    cy.get('[data-cy=virtual-keyboard] .white-key').should('have.length', 21); // 7 white keys × 3 octaves
    cy.get('[data-cy=virtual-keyboard] .black-key').should('have.length', 15); // 5 black keys × 3 octaves
    
    // Change starting octave
    cy.get('[data-cy=start-octave-select]').select('2');
    cy.get('[data-cy=virtual-keyboard]').should('be.visible');
    // Same number of keys, but different starting octave
    cy.get('[data-cy=virtual-keyboard] .white-key').should('have.length', 21);
  });
  
  it('should play notes when keys are clicked', () => {
    // Spy on the playNote function
    cy.window().then((win) => {
      cy.spy(win.midiController, 'playNote').as('playNoteSpy');
    });
    
    // Click the first white key (C4)
    cy.get('[data-cy=virtual-keyboard] .white-key').first().click();
    
    // Verify the note was played with the correct MIDI number
    cy.get('@playNoteSpy').should('have.been.calledWith', 60);
    
    // Click a black key (C#4)
    cy.get('[data-cy=virtual-keyboard] .black-key').first().click();
    
    // Verify the black note was played
    cy.get('@playNoteSpy').should('have.been.calledWith', 61);
  });
  
  it('should highlight keys when notes are played from other sources', () => {
    // Trigger a note from the piano roll
    cy.get('[data-cy=piano-roll-tab]').click();
    cy.addPianoRollNote(60, 0); // C4 note
    
    // Play the sequence
    cy.get('[data-cy=play-button]').click();
    
    // Go back to keyboard tab
    cy.get('[data-cy=keyboard-tab]').click();
    
    // Verify the key is highlighted during playback
    cy.get('[data-cy=virtual-keyboard] .white-key.active').should('exist');
  });
  
  it('should toggle note names display', () => {
    // Initially note names should be hidden
    cy.get('[data-cy=virtual-keyboard] .note-name').should('not.exist');
    
    // Toggle note names on
    cy.get('[data-cy=show-note-names-toggle]').click();
    
    // Verify note names are displayed
    cy.get('[data-cy=virtual-keyboard] .note-name').should('be.visible');
    cy.get('[data-cy=virtual-keyboard] .note-name').first().should('contain', 'C');
  });
  
  it('should record notes played on the keyboard', () => {
    // Enable recording mode
    cy.get('[data-cy=record-button]').click();
    
    // Verify recording indicator is active
    cy.get('[data-cy=recording-indicator]').should('be.visible');
    
    // Play a few notes on the keyboard
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(0).click(); // C4
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(2).click(); // E4
    cy.get('[data-cy=virtual-keyboard] .white-key').eq(4).click(); // G4
    
    // Stop recording
    cy.get('[data-cy=stop-button]').click();
    
    // Navigate to piano roll to verify notes were recorded
    cy.get('[data-cy=piano-roll-tab]').click();
    
    // Verify the 3 notes are visible in the piano roll
    cy.get('[data-cy=piano-roll-note]').should('have.length', 3);
  });
  
  it('should work with MIDI keyboard input', () => {
    // Mock MIDI input events
    cy.window().then((win) => {
      // Create a fake MIDI message for note on (C4, velocity 100)
      const noteOnMessage = { data: [0x90, 60, 100] }; // Note On, C4, velocity 100
      
      // Dispatch the event
      win.dispatchEvent(new CustomEvent('midimessage', { detail: noteOnMessage }));
    });
    
    // Verify C4 key was activated
    cy.get('[data-cy=virtual-keyboard] .white-key.active').first().should('exist');
    
    // Send note off message
    cy.window().then((win) => {
      const noteOffMessage = { data: [0x80, 60, 0] }; // Note Off, C4, velocity 0
      win.dispatchEvent(new CustomEvent('midimessage', { detail: noteOffMessage }));
    });
    
    // Verify key is no longer active
    cy.get('[data-cy=virtual-keyboard] .white-key.active').should('not.exist');
  });
});
