// routes/exportRoutes.js
const express = require('express');
const router = express.Router();

// GET /api/export/json/:sessionId
router.get('/json/:sessionId', (req, res) => {
  res.json({
    data: {
      id: req.params.sessionId,
      name: 'Test Session',
      tempo: 120,
      tracks: []
    },
    exportDate: new Date().toISOString()
  });
});

// GET /api/export/midi/:sessionId
router.get('/midi/:sessionId', (req, res) => {
  // For testing, just return a simple buffer
  const buffer = Buffer.from('MIDI content');
  
  res.setHeader('Content-Type', 'audio/midi');
  res.setHeader('Content-Disposition', 'attachment; filename="export.mid"');
  res.send(buffer);
});

// POST /api/export/import
router.post('/import', (req, res) => {
  res.status(201).json({
    session: {
      id: 'imported-session',
      name: 'Imported Session',
      tempo: 120,
      tracks: []
    }
  });
});

module.exports = router;