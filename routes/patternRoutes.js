// routes/patternRoutes.js
const express = require('express');
const router = express.Router();

// POST /api/patterns - Generate a pattern
router.post('/', (req, res) => {
  const { type, patternType, rootNote, bars } = req.body;
  
  // Validate pattern type
  if (patternType === 'invalid-pattern') {
    return res.status(400).json({ error: 'Invalid pattern type' });
  }
  
  // Generate sample notes based on pattern type
  const notes = [];
  
  for (let i = 0; i < 4; i++) {
    notes.push({
      id: `note-${Date.now()}-${i}`,
      pitch: 60 + i,
      start: i * 0.5,
      duration: 0.5,
      velocity: 100
    });
  }
  
  res.status(201).json({ notes });
});

// GET /api/patterns/templates - List pattern templates
router.get('/templates', (req, res) => {
  res.json({
    templates: [
      { id: 'chord-basic', name: 'Basic Chords', type: 'chord' },
      { id: 'bassline-walking', name: 'Walking Bass', type: 'bassline' },
      { id: 'drum-basic', name: 'Basic Beat', type: 'drum' }
    ]
  });
});

module.exports = router;