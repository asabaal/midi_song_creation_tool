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
    
    // CRITICAL: For debugging - Let's see exactly what's in the session
    console.log(`[DEBUG] Session object instanceof Session: ${session instanceof Session}`);
    console.log(`[DEBUG] Session has _syncTrackWithSequence: ${typeof session._syncTrackWithSequence === 'function'}`);
    
    // If we have sequences but no tracks, initialize tracks
    if (!session.tracks) {
      session.tracks = [];
      console.log(`[DEBUG] Initialized empty tracks array`);
    }
    
    // CRITICAL: Ensure tracks are synchronized with sequence notes
    // If session has sequences with notes but tracks don't match, sync them
    if (session.sequences && session.currentSequenceId && session.sequences[session.currentSequenceId]) {
      const currentSequence = session.sequences[session.currentSequenceId];
      console.log(`[DEBUG] Current sequence ${session.currentSequenceId} exists with ${currentSequence.notes ? currentSequence.notes.length : 0} notes`);
      
      // Verify the currentSequence has notes
      if (currentSequence.notes && currentSequence.notes.length > 0) {
        console.log(`[DEBUG] Current sequence has ${currentSequence.notes.length} notes`);
        
        // Force sync all tracks with their sequences
        if (typeof session._syncTrackWithSequence === 'function') {
          try {
            session._syncTrackWithSequence(currentSequence);
            console.log(`[DEBUG] Synchronized tracks with sequences`);
          } catch (e) {
            console.error(`[DEBUG] Error syncing tracks: ${e.message}`);
          }
        } else {
          // EMERGENCY WORKAROUND - If sync method isn't available, directly update tracks
          let track = session.tracks.find(t => t.id === currentSequence.id);
          if (!track) {
            track = {
              id: currentSequence.id,
              name: currentSequence.name || 'Current Sequence',
              instrument: 0,
              notes: []
            };
            session.tracks.push(track);
            console.log(`[DEBUG] EMERGENCY: Created new track for ${currentSequence.id}`);
          }
          
          // CRITICAL: Force copy notes from sequence to track
          track.notes = JSON.parse(JSON.stringify(currentSequence.notes || []));
          console.log(`[DEBUG] EMERGENCY: Directly copied ${track.notes.length} notes to track`);
        }
      }
    } else {
      console.log(`[DEBUG] No current sequence found`);
    }
    
    // Count the number of notes in all tracks for logging
    const totalNotes = session.tracks ? 
      session.tracks.reduce((sum, track) => sum + (track.notes ? track.notes.length : 0), 0) : 0;
    console.log(`[DEBUG] Session has ${session.tracks ? session.tracks.length : 0} tracks with a total of ${totalNotes} notes`);
    
    // LAST RESORT - If no notes in tracks, but notes exist in sequence, create a new track with those notes
    if (totalNotes === 0 && session.sequences && session.currentSequenceId) {
      const seq = session.sequences[session.currentSequenceId];
      if (seq && seq.notes && seq.notes.length > 0) {
        console.warn(`[DEBUG] WARNING: Sequence has ${seq.notes.length} notes but tracks have 0! Creating emergency track`);
        
        // Create emergency track
        const emergencyTrack = {
          id: seq.id,
          name: seq.name || 'Emergency Track',
          instrument: 0,
          notes: JSON.parse(JSON.stringify(seq.notes)) // Deep copy to ensure no reference issues
        };
        
        // Add or replace track
        const existingTrackIndex = session.tracks.findIndex(t => t.id === seq.id);
        if (existingTrackIndex >= 0) {
          session.tracks[existingTrackIndex] = emergencyTrack;
        } else {
          session.tracks.push(emergencyTrack);
        }
        
        console.log(`[DEBUG] Created emergency track with ${emergencyTrack.notes.length} notes`);
      }
    }
    
    // Save any updates we've made to the session
    await session.save();
    
    // CRITICAL: Double check that we have tracks and notes before sending response
    const finalTracksCount = session.tracks ? session.tracks.length : 0;
    const finalNotesCount = session.tracks ? 
      session.tracks.reduce((sum, track) => sum + (track.notes ? track.notes.length : 0), 0) : 0;
    
    console.log(`[DEBUG] FINAL CHECK: Sending response with ${finalTracksCount} tracks and ${finalNotesCount} total notes`);
    
    // If we still have no notes but sequences exist, print a detailed warning
    if (finalNotesCount === 0 && session.sequences && Object.keys(session.sequences).length > 0) {
      console.warn(`[DEBUG] CRITICAL WARNING: About to send response with 0 notes despite having sequences!`);
      console.warn(`[DEBUG] Available sequences: ${Object.keys(session.sequences).join(', ')}`);
      if (session.currentSequenceId) {
        const seqNotes = session.sequences[session.currentSequenceId].notes;
        console.warn(`[DEBUG] Current sequence has ${seqNotes ? seqNotes.length : 0} notes that are NOT in tracks!`);
      }
    }
    
    // Format the response in the exact way the client expects
    res.json({
      success: true,
      session: {
        id: session.id,
        created: session.createdAt || new Date(),
        currentSequenceId: session.currentSequenceId,
        sequences: session.listSequences ? session.listSequences() : [],
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