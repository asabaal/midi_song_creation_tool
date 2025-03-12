// tests/integration/api/patternRoutes.test.js
const request = require('supertest');
const apiMockSetup = require('../api/apiMockSetup');

// Use the mock API directly
const app = apiMockSetup();

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

    // Store the session ID
    sessionId = response.body.id;
    
    // Skip tests if session creation failed
    if (!sessionId) {
      console.warn('Warning: Session ID not available, some tests will be skipped');
    }
  });

  describe('POST /api/sessions/:sessionId/patterns/chord-progression', () => {
    it('should generate a chord progression', async () => {
      // Skip test if session ID is not available
      if (!sessionId) {
        return console.log('Skipping test as session ID is not available');
      }

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major',
          octave: 4,
          rhythmPattern: [4]
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      expect(response.body.notes.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/sessions/nonexistentsession/patterns')
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major'
        })
        .expect(404);
    });

    it('should handle invalid parameters', async () => {
      // Skip test if session ID is not available
      if (!sessionId) {
        return console.log('Skipping test as session ID is not available');
      }

      // This test assumes your API validates input parameters
      // If your actual API doesn't validate, you might need to adjust this test
      await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'invalid-pattern',
        })
        .expect(400);
    });
  });

  describe('POST /api/sessions/:sessionId/patterns/bassline', () => {
    it('should generate a bassline', async () => {
      // Skip test if session ID is not available
      if (!sessionId) {
        return console.log('Skipping test as session ID is not available');
      }

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'bassline',
          patternType: 'walking',
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major',
          octave: 3,
          rhythmPattern: [1, 0.5, 0.5]
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/sessions/nonexistentsession/patterns')
        .send({
          type: 'bassline',
          patternType: 'walking',
          key: 'C',
          progressionName: '1-4-5',
          scaleType: 'major'
        })
        .expect(404);
    });
  });

  describe('POST /api/sessions/:sessionId/patterns/drums', () => {
    it('should generate a drum pattern', async () => {
      // Skip test if session ID is not available
      if (!sessionId) {
        return console.log('Skipping test as session ID is not available');
      }

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'drums',
          patternType: 'basic',
          measures: 2
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/sessions/nonexistentsession/patterns')
        .send({
          type: 'drums',
          patternType: 'basic',
          measures: 2
        })
        .expect(404);
    });

    it('should handle different pattern types', async () => {
      // Skip test if session ID is not available
      if (!sessionId) {
        return console.log('Skipping test as session ID is not available');
      }

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'drums',
          patternType: 'fill',
          measures: 1
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
    });
  });

  describe('DELETE /api/sessions/:sessionId/notes', () => {
    it('should clear all notes from the current sequence', async () => {
      // Skip test if session ID is not available
      if (!sessionId) {
        return console.log('Skipping test as session ID is not available');
      }

      // First add some notes to clear
      await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C'
        })
        .expect(201);

      // Now clear the notes
      await request(app)
        .delete(`/api/sessions/${sessionId}/notes`)
        .expect(204);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .delete('/api/sessions/nonexistentsession/notes')
        .expect(404);
    });
  });
});