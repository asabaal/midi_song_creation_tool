const request = require('supertest');
const { mockApp } = require('../testSetup');

describe('Error Recovery Tests', () => {
  let sessionId;

  beforeEach(async () => {
    // Create a test session for each test
    const sessionResponse = await request(mockApp)
      .post('/api/sessions')
      .send({
        name: 'Error Recovery Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    sessionId = sessionResponse.body.id;
  });

  describe('Session State Recovery', () => {
    it('should maintain session state after failed operations', async () => {
      // First, add a valid note
      const validNote = {
        pitch: 60,
        start: 0,
        duration: 1,
        velocity: 100
      };

      const validResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send(validNote);

      expect(validResponse.status).toBe(201);
      const validNoteId = validResponse.body.id;

      // Now attempt an invalid operation
      const invalidNote = {
        // Missing required parameters
        velocity: 100
      };

      const invalidResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send(invalidNote);

      expect(invalidResponse.status).toBe(400);

      // Verify session still exists and is accessible
      const sessionResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(sessionResponse.body).toHaveProperty('id', sessionId);
    });

    it('should handle interrupted pattern generation gracefully', async () => {
      // First attempt an invalid pattern generation
      const invalidPattern = {
        type: 'chord',
        patternType: 'invalid-pattern',
        key: 'C',
        scaleType: 'major'
      };

      const invalidResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send(invalidPattern);

      expect(invalidResponse.status).toBe(400);

      // Then attempt a valid pattern generation to verify system still works
      const validPattern = {
        type: 'chord',
        patternType: 'progression',
        key: 'C',
        scaleType: 'major'
      };

      const validResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send(validPattern);

      expect(validResponse.status).toBe(201);
      expect(validResponse.body).toHaveProperty('notes');
      expect(Array.isArray(validResponse.body.notes)).toBe(true);
    });
  });

  describe('Partial Updates', () => {
    it('should handle partial session updates correctly', async () => {
      // Update just the tempo
      const tempoResponse = await request(mockApp)
        .put(`/api/sessions/${sessionId}`)
        .send({
          tempo: 140
        });

      expect(tempoResponse.status).toBe(200);
      expect(tempoResponse.body).toHaveProperty('tempo', 140);
      expect(tempoResponse.body).toHaveProperty('name', 'Error Recovery Test Session'); // Name should be preserved

      // Now update just the name
      const nameResponse = await request(mockApp)
        .put(`/api/sessions/${sessionId}`)
        .send({
          name: 'Updated Session Name'
        });

      expect(nameResponse.status).toBe(200);
      expect(nameResponse.body).toHaveProperty('name', 'Updated Session Name');
      expect(nameResponse.body).toHaveProperty('tempo', 140); // Tempo from previous update should be preserved
    });

    it('should handle concurrent operations without corruption', async () => {
      // First create some notes
      const notePromises = [];
      for (let i = 0; i < 5; i++) {
        notePromises.push(
          request(mockApp)
            .post(`/api/sessions/${sessionId}/notes`)
            .send({
              pitch: 60 + i,
              start: i * 0.5,
              duration: 0.5,
              velocity: 100
            })
        );
      }

      // Execute all note creations concurrently
      const noteResults = await Promise.all(notePromises);

      // Verify all notes were created successfully
      for (const result of noteResults) {
        expect(result.status).toBe(201);
        expect(result.body).toHaveProperty('id');
      }

      // Verify session is still in a good state
      const sessionResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(sessionResponse.body).toHaveProperty('id', sessionId);
    });
  });

  describe('Error Boundary Testing', () => {
    it('should handle non-existent resources gracefully', async () => {
      // Try to access a non-existent session
      await request(mockApp)
        .get('/api/sessions/non-existent-id')
        .expect(404);

      // Try to access a non-existent note
      await request(mockApp)
        .get(`/api/sessions/${sessionId}/notes/non-existent-note-id`)
        .expect(404);

      // Verify our real session still exists and is accessible
      const sessionResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(sessionResponse.body).toHaveProperty('id', sessionId);
    });

    it('should recover from a malformed request body', async () => {
      // Send a malformed JSON body
      await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .set('Content-Type', 'application/json')
        .send('this is not valid JSON')
        .expect(400);

      // Verify we can still make a valid request afterward
      const validResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 60,
          start: 0,
          duration: 1,
          velocity: 100
        });

      expect(validResponse.status).toBe(201);
    });
  });
});
