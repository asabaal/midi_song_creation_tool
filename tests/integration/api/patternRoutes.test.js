// tests/integration/api/patternRoutes.test.js
const request = require('supertest');
const app = require('../../../src/server/app');

describe('Pattern Generation API Integration Tests', () => {
  let sessionId;

  // Create a session before tests
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Pattern Test Session',
        bpm: 120,
        timeSignature: [4, 4]
      });

    sessionId = response.body._id || response.body.id;
    expect(sessionId).toBeTruthy();
  });

  describe('POST /api/sessions/:sessionId/patterns/chord-progression', () => {
    it('should generate a chord progression', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns/chord-progression`)
        .send({
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major',
          octave: 4,
          rhythmPattern: [4]
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Added');
      expect(response.body.message).toContain('notes');
      expect(response.body).toHaveProperty('noteCount');
      expect(response.body.noteCount).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/sessions/nonexistentsession/patterns/chord-progression')
        .send({
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major'
        })
        .expect(404);
    });

    it('should handle invalid parameters', async () => {
      await request(app)
        .post(`/api/sessions/${sessionId}/patterns/chord-progression`)
        .send({
          key: 'H', // Invalid note
          progressionName: '1-4-5',
          scaleType: 'major'
        })
        .expect(400);
    });
  });

  describe('POST /api/sessions/:sessionId/patterns/bassline', () => {
    it('should generate a bassline', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns/bassline`)
        .send({
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major',
          octave: 3,
          rhythmPattern: [1, 0.5, 0.5]
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Added');
      expect(response.body.message).toContain('bassline');
      expect(response.body).toHaveProperty('noteCount');
      expect(response.body.noteCount).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/sessions/nonexistentsession/patterns/bassline')
        .send({
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major'
        })
        .expect(404);
    });
  });

  describe('POST /api/sessions/:sessionId/patterns/drums', () => {
    it('should generate a drum pattern', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns/drums`)
        .send({
          patternType: 'basic',
          measures: 2
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Added');
      expect(response.body.message).toContain('drum');
      expect(response.body).toHaveProperty('noteCount');
      expect(response.body.noteCount).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/sessions/nonexistentsession/patterns/drums')
        .send({
          patternType: 'basic',
          measures: 2
        })
        .expect(404);
    });

    it('should handle different pattern types', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns/drums`)
        .send({
          patternType: 'fill',
          measures: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Added');
      expect(response.body.message).toContain('fill');
      expect(response.body).toHaveProperty('noteCount');
      expect(response.body.noteCount).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/sessions/:sessionId/notes', () => {
    it('should clear all notes from the current sequence', async () => {
      // First add some notes to clear
      await request(app)
        .post(`/api/sessions/${sessionId}/patterns/chord-progression`)
        .send({
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major'
        })
        .expect(200);

      // Now clear the notes
      const response = await request(app)
        .delete(`/api/sessions/${sessionId}/notes`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Cleared');
      expect(response.body).toHaveProperty('currentSequenceId');
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .delete('/api/sessions/nonexistentsession/notes')
        .expect(404);
    });
  });
});
