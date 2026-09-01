/**
 * Tests for chord progression API routes
 */

const request = require('supertest');
const express = require('express');
const chordProgressionRoutes = require('../../../src/server/routes/chordProgressionRoutes');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/chord-progression', chordProgressionRoutes);

describe('Chord Progression API Routes', () => {
  describe('GET /api/chord-progression/keys', () => {
    test('should return all available keys', async () => {
      const response = await request(app)
        .get('/api/chord-progression/keys')
        .expect(200);

      expect(response.body).toHaveProperty('major');
      expect(response.body).toHaveProperty('minor');
      expect(response.body).toHaveProperty('all');
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBe(30);
      expect(response.body.major).toHaveLength(15);
      expect(response.body.minor).toHaveLength(15);
    });
  });

  describe('GET /api/chord-progression/diatonic-chords/:key', () => {
    test('should return diatonic chords for C major', async () => {
      const response = await request(app)
        .get('/api/chord-progression/diatonic-chords/C%20major')
        .expect(200);

      expect(response.body).toHaveProperty('key', 'C major');
      expect(response.body).toHaveProperty('chords');
      expect(response.body).toHaveProperty('count', 7);
      expect(response.body.chords).toHaveLength(7);

      const chordNames = response.body.chords.map(c => c.name);
      expect(chordNames).toContain('C major');
      expect(chordNames).toContain('D minor');
      expect(chordNames).toContain('E minor');
      expect(chordNames).toContain('F major');
      expect(chordNames).toContain('G major');
      expect(chordNames).toContain('A minor');
      expect(chordNames).toContain('B diminished');
    });

    test('should return diatonic chords for A minor', async () => {
      const response = await request(app)
        .get('/api/chord-progression/diatonic-chords/A%20minor')
        .expect(200);

      expect(response.body).toHaveProperty('key', 'A minor');
      expect(response.body.chords).toHaveLength(7);
    });

    test('should return 400 for invalid key', async () => {
      const response = await request(app)
        .get('/api/chord-progression/diatonic-chords/Invalid%20key')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/chord-progression/analyze-custom', () => {
    test('should analyze custom chord with notes', async () => {
      const chordData = {
        notes: ['C4', 'E4', 'G4'],
        name: 'C major'
      };

      const response = await request(app)
        .post('/api/chord-progression/analyze-custom')
        .send(chordData)
        .expect(200);

      expect(response.body).toHaveProperty('chord');
      expect(response.body.chord).toHaveProperty('name', 'C major');
      expect(response.body.chord).toHaveProperty('type', 'major');
      expect(response.body.chord).toHaveProperty('notes');
      expect(response.body.chord).toHaveProperty('midiNotes');
    });

    test('should analyze custom chord with MIDI notes', async () => {
      const chordData = {
        midiNotes: [60, 64, 67],
        name: 'C major'
      };

      const response = await request(app)
        .post('/api/chord-progression/analyze-custom')
        .send(chordData)
        .expect(200);

      expect(response.body.chord).toHaveProperty('type', 'major');
      expect(response.body.chord.midiNotes).toEqual([60, 64, 67]);
    });

    test('should return 400 for missing notes', async () => {
      const chordData = {
        name: 'C major'
      };

      const response = await request(app)
        .post('/api/chord-progression/analyze-custom')
        .send(chordData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/chord-progression/generate', () => {
    test('should generate progression from roman numerals', async () => {
      const progressionData = {
        key: 'C major',
        progression: ['I', 'IV', 'V', 'I']
      };

      const response = await request(app)
        .post('/api/chord-progression/generate')
        .send(progressionData)
        .expect(200);

      expect(response.body).toHaveProperty('key', 'C major');
      expect(response.body).toHaveProperty('progression');
      expect(response.body.progression).toHaveLength(4);

      const chordNames = response.body.progression.map(p => p.name);
      expect(chordNames).toEqual(['C major', 'F major', 'G major', 'C major']);
    });

    test('should generate common progressions', async () => {
      const progressionData = {
        key: 'C major',
        type: 'common'
      };

      const response = await request(app)
        .post('/api/chord-progression/generate')
        .send(progressionData)
        .expect(200);

      expect(response.body).toHaveProperty('commonProgressions');
      expect(Array.isArray(response.body.commonProgressions)).toBe(true);
      expect(response.body.commonProgressions.length).toBeGreaterThan(0);
    });

    test('should return 400 for invalid progression', async () => {
      const progressionData = {
        key: 'C major',
        progression: []
      };

      const response = await request(app)
        .post('/api/chord-progression/generate')
        .send(progressionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/chord-progression/export', () => {
    test('should export progression as MIDI', async () => {
      const exportData = {
        progression: {
          key: 'C major',
          progression: [
            { name: 'C major', midiNotes: [60, 64, 67], duration: '1/4' },
            { name: 'G major', midiNotes: [67, 71, 74], duration: '1/4' }
          ]
        },
        format: 'midi',
        options: { tempo: 120 }
      };

      const response = await request(app)
        .post('/api/chord-progression/export')
        .send(exportData)
        .expect(200);

      expect(response.body).toHaveProperty('midiData');
      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toMatch(/\.mid$/);
      expect(typeof response.body.midiData).toBe('string');
      expect(response.body.midiData.length).toBeGreaterThan(0);
    });

    test('should return 400 for missing progression', async () => {
      const exportData = {
        format: 'midi'
      };

      const response = await request(app)
        .post('/api/chord-progression/export')
        .send(exportData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/chord-progression/chord-types', () => {
    test('should return available chord types', async () => {
      const response = await request(app)
        .get('/api/chord-progression/chord-types')
        .expect(200);

      expect(response.body).toHaveProperty('chordTypes');
      expect(Array.isArray(response.body.chordTypes)).toBe(true);
      expect(response.body.chordTypes.length).toBeGreaterThan(0);

      const types = response.body.chordTypes;
      expect(types).toContain('major');
      expect(types).toContain('minor');
      expect(types).toContain('diminished');
    });
  });

  describe('POST /api/chord-progression/validate', () => {
    test('should validate correct progression', async () => {
      const validationData = {
        key: 'C major',
        progression: ['I', 'IV', 'V', 'I']
      };

      const response = await request(app)
        .post('/api/chord-progression/validate')
        .send(validationData)
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should detect invalid progression', async () => {
      const validationData = {
        key: 'C major',
        progression: ['I', 'X', 'V', 'I'] // X is invalid
      };

      const response = await request(app)
        .post('/api/chord-progression/validate')
        .send(validationData)
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});