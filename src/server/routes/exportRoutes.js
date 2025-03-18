// src/server/routes/exportRoutes.js
const express = require('express');
const router = express.Router();
const midiExport = require('../../core/midiExport');
const { Session } = require('../models/session');

/**
 * Export session to MIDI file
 * GET /api/export/midi/:sessionId
 */
router.get('/midi/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Generate MIDI file
    const midiData = await midiExport.sessionToMidiFile(session);
    
    // Set response headers for file download
    const filename = session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mid';
    res.setHeader('Content-Type', 'audio/midi');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', midiData.length);
    
    // Send the MIDI file data
    res.send(midiData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Export session to JSON
 * GET /api/export/json/:sessionId
 */
router.get('/json/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Return session data as JSON
    res.json({
      success: true,
      message: `Exported session ${sessionId} as JSON`,
      sessionId: session._id,
      data: session
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Import session from JSON
 * POST /api/export/import
 */
router.post('/import', async (req, res) => {
  try {
    const { data, name } = req.body;
    
    // Validate data
    if (!data) {
      return res.status(400).json({ error: 'No data provided for import' });
    }
    
    // Process data based on format
    let importData;
    if (typeof data === 'string') {
      try {
        importData = JSON.parse(data);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
    } else if (typeof data === 'object') {
      importData = data;
    } else {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    // Create a new session from the imported data
    const session = new Session({
      name: name || importData.name || 'Imported Session',
      bpm: importData.bpm || 120,
      timeSignature: importData.timeSignature || [4, 4],
      tracks: importData.tracks || []
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Session imported successfully',
      sessionId: session._id,
      session: {
        id: session._id,
        name: session.name,
        bpm: session.bpm,
        trackCount: session.tracks.length,
        noteCount: session.tracks.reduce((total, track) => total + track.notes.length, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;