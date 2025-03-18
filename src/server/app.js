// Let's add a new debug endpoint
app.get('/debug/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`Debug endpoint for session ${sessionId}`);
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }
    
    // Get detailed info about the session
    const sessionInfo = {
      id: session.id,
      isSessionInstance: session instanceof Session,
      hasPrototypeMethods: typeof session._syncTrackWithSequence === 'function',
      currentSequenceId: session.currentSequenceId,
      sequenceKeys: Object.keys(session.sequences || {}),
      tracksCount: session.tracks ? session.tracks.length : 0,
      tracksInfo: session.tracks ? session.tracks.map(track => ({
        id: track.id,
        name: track.name,
        notesCount: track.notes ? track.notes.length : 0,
        instrument: track.instrument,
        firstFewNotes: track.notes ? track.notes.slice(0, 3).map(note => ({
          pitch: note.pitch,
          startTime: note.startTime,
          duration: note.duration,
          channel: note.channel
        })) : []
      })) : [],
      currentSequence: session.currentSequenceId && session.sequences && session.sequences[session.currentSequenceId] ? {
        id: session.sequences[session.currentSequenceId].id,
        name: session.sequences[session.currentSequenceId].name,
        notesCount: session.sequences[session.currentSequenceId].notes ? session.sequences[session.currentSequenceId].notes.length : 0,
        firstFewNotes: session.sequences[session.currentSequenceId].notes ? 
          session.sequences[session.currentSequenceId].notes.slice(0, 3).map(note => ({
            pitch: note.pitch,
            startTime: note.startTime,
            duration: note.duration,
            channel: note.channel
          })) : []
      } : null,
      // Include information specifically formatted as the client expects
      clientFormat: {
        success: true,
        session: {
          id: session.id,
          created: session.createdAt || new Date(),
          currentSequenceId: session.currentSequenceId,
          sequences: session.listSequences ? session.listSequences() : [],
          tracks: session.tracks || []
        }
      }
    };
    
    res.json(sessionInfo);
  } catch (error) {
    console.error(`Error in debug endpoint: ${error.message}`);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});