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
    // If session has sequences with notes but tracks don't match, sync them
    if (session.sequences && session.currentSequenceId && session.sequences[session.currentSequenceId]) {
      const currentSequence = session.sequences[session.currentSequenceId];
      
      // Verify the currentSequence has notes
      if (currentSequence.notes && currentSequence.notes.length > 0) {
        console.log(`[GET /sessions/${sessionId}] Current sequence has ${currentSequence.notes.length} notes`);
        
        // Force sync all tracks with their sequences
        if (typeof session._syncTrackWithSequence === 'function') {
          session._syncTrackWithSequence(currentSequence);
          console.log(`[GET /sessions/${sessionId}] Synchronized tracks with sequences`);
        } else {
          console.warn(`[GET /sessions/${sessionId}] Session synchronization method not available`);
        }
      }
    } else {
      console.log(`[GET /sessions/${sessionId}] No current sequence found`);
    }
    
    // Count the number of notes in all tracks for logging
    const totalNotes = session.tracks ? 
      session.tracks.reduce((sum, track) => sum + (track.notes ? track.notes.length : 0), 0) : 0;
    console.log(`[GET /sessions/${sessionId}] Session has ${session.tracks ? session.tracks.length : 0} tracks with a total of ${totalNotes} notes`);
    
    // Save any updates we've made to the session
    await session.save();
    
    // For debugging - check we actually have notes to return
    if (totalNotes === 0 && session.sequences && session.currentSequenceId) {
      const seq = session.sequences[session.currentSequenceId];
      if (seq && seq.notes && seq.notes.length > 0) {
        console.warn(`[GET /sessions/${sessionId}] WARNING: Sequence has ${seq.notes.length} notes but tracks have 0!`);
      }
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.createdAt,
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences(),
        tracks: session.tracks || []
      }
    });
  } catch (error) {
    console.error(`Error getting session: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});