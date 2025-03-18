//================================================
// CRITICAL: GET SESSION HANDLER FOR WEB UI
//================================================

// This is the critical endpoint the web UI uses to fetch the notes
app.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`[GET /sessions/${sessionId}] Getting session for web UI`);
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: `No session with ID ${sessionId} exists`
      });
    }
    
    // CRITICAL: Ensure tracks are synchronized with sequence notes
    // This is the direct approach when all else fails
    console.log(`[GET /sessions/${sessionId}] Direct patching of session data for track synchronization`);
    
    // Step 1: Get current sequence and its notes
    const currentSequence = session.getCurrentSequence();
    if (!currentSequence) {
      console.log(`[GET /sessions/${sessionId}] No current sequence found`);
    } else {
      console.log(`[GET /sessions/${sessionId}] Current sequence: ${currentSequence.id} with ${currentSequence.notes ? currentSequence.notes.length : 0} notes`);
      
      // Step 2: Find or create matching track
      let currentTrack = session.tracks.find(t => t.id === currentSequence.id);
      
      if (!currentTrack) {
        // Create new track if needed
        currentTrack = {
          id: currentSequence.id,
          name: currentSequence.name || 'New Track',
          instrument: 0, // Default instrument
          notes: []
        };
        session.tracks.push(currentTrack);
        console.log(`[GET /sessions/${sessionId}] Created new track for sequence ${currentSequence.id}`);
      }
      
      // Step 3: Override the notes in the track with the sequence notes
      if (currentSequence.notes && currentSequence.notes.length > 0) {
        console.log(`[GET /sessions/${sessionId}] Copying ${currentSequence.notes.length} notes from sequence to track`);
        
        // Direct copy
        currentTrack.notes = JSON.parse(JSON.stringify(currentSequence.notes));
        
        // Add channel info if missing
        currentTrack.notes.forEach(note => {
          if (!note.channel) {
            note.channel = 0; // Default channel
          }
        });
      }
    }
    
    // Count the number of notes in all tracks for logging
    const totalNotes = session.tracks ? 
      session.tracks.reduce((sum, track) => sum + (track.notes ? track.notes.length : 0), 0) : 0;
    console.log(`[GET /sessions/${sessionId}] Session has ${session.tracks ? session.tracks.length : 0} tracks with a total of ${totalNotes} notes`);
    
    // Save any updates we've made to the session
    await session.save();
    
    // Return the session data in the expected format
    const responseData = {
      success: true,
      session: {
        id: session.id,
        created: session.createdAt,
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences(),
        tracks: session.tracks || []
      }
    };
    
    // Final sanity check
    if (responseData.session.tracks && responseData.session.tracks.length > 0) {
      const trackNotesCount = responseData.session.tracks.reduce((sum, t) => sum + (t.notes ? t.notes.length : 0), 0);
      console.log(`[GET /sessions/${sessionId}] Response contains ${responseData.session.tracks.length} tracks with ${trackNotesCount} notes total`);
    }
    
    res.json(responseData);
  } catch (error) {
    console.error(`Error getting session: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});