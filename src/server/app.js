// Add before the "Special debug route" already in the file

// Special debug endpoint to investigate track/note issues
app.get('/api/debug/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const currentSequence = session.getCurrentSequence();
    const sequenceNotes = currentSequence ? currentSequence.notes || [] : [];
    
    // Find matching track
    const matchingTrack = session.tracks.find(t => 
      currentSequence && t.id === currentSequence.id
    );
    
    const trackNotes = matchingTrack ? matchingTrack.notes || [] : [];
    
    // Deep copy so we can safely check structures
    const debugInfo = {
      session: JSON.parse(JSON.stringify({
        id: session.id,
        hasSequences: !!session.sequences,
        sequenceCount: session.sequences ? Object.keys(session.sequences).length : 0,
        currentSequenceId: session.currentSequenceId,
        trackCount: session.tracks ? session.tracks.length : 0,
        hasSyncMethod: typeof session._syncTrackWithSequence === 'function',
        isPrototype: session instanceof Session
      })),
      currentSequence: currentSequence ? JSON.parse(JSON.stringify({
        id: currentSequence.id,
        name: currentSequence.name,
        notesCount: sequenceNotes.length,
        notes: sequenceNotes.slice(0, 2) // Just show first few notes for brevity
      })) : null,
      matchingTrack: matchingTrack ? JSON.parse(JSON.stringify({
        id: matchingTrack.id,
        name: matchingTrack.name,
        instrument: matchingTrack.instrument,
        notesCount: trackNotes.length,
        notes: trackNotes.slice(0, 2) // Just show first few notes for brevity
      })) : null,
      allTracks: session.tracks ? session.tracks.map(track => ({
        id: track.id,
        name: track.name,
        notesCount: track.notes ? track.notes.length : 0
      })) : []
    };
    
    res.json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});