const request = require('supertest');
const { mockApp } = require('../testSetup');

describe('Export/Import API Integration Tests', () => {
  let sessionId;

  beforeEach(async () => {
    // Create a test session for each test
    const sessionResponse = await request(mockApp)
      .post('/api/sessions')
      .send({
        name: 'Export Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    sessionId = sessionResponse.body.id;
  });

  describe('JSON Export/Import', () => {
    it('GET /api/export/json/:sessionId should export session data as JSON', async () => {
      const response = await request(mockApp)
        .get(`/api/export/json/${sessionId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Export Test Session');
    });

    it('GET /api/export/json/:sessionId should return 404 for non-existent session', async () => {
      await request(mockApp)
        .get('/api/export/json/nonexistentsession')
        .expect(404);
    });

    it('POST /api/export/import should import session data from JSON', async () => {
      // First get the JSON export
      const exportResponse = await request(mockApp)
        .get(`/api/export/json/${sessionId}`);

      // Then import it as a new session
      const importResponse = await request(mockApp)
        .post('/api/export/import')
        .send(exportResponse.body)
        .expect(201);

      expect(importResponse.body).toHaveProperty('name', 'Export Test Session');
      expect(importResponse.body.id).not.toBe(sessionId); // Should be a new ID
    });

    it('POST /api/export/import should handle importing a string JSON representation', async () => {
      // First get the JSON export
      const exportResponse = await request(mockApp)
        .get(`/api/export/json/${sessionId}`);

      // Convert to string
      const jsonString = JSON.stringify(exportResponse.body);

      // Then import it as a new session
      const importResponse = await request(mockApp)
        .post('/api/export/import')
        .send(jsonString)
        .expect(201);

      expect(importResponse.body).toHaveProperty('name', 'Export Test Session');
    });

    it('POST /api/export/import should reject invalid JSON data', async () => {
      await request(mockApp)
        .post('/api/export/import')
        .send('this is not valid JSON')
        .expect(400);
    });

    it('POST /api/export/import should reject empty data', async () => {
      await request(mockApp)
        .post('/api/export/import')
        .send({})
        .expect(400);
    });
  });

  describe('MIDI Export', () => {
    it('GET /api/export/midi/:sessionId should export session as MIDI file', async () => {
      const response = await request(mockApp)
        .get(`/api/export/midi/${sessionId}`)
        .expect(200)
        .expect('Content-Type', /octet-stream/)
        .expect('Content-Disposition', /attachment/);

      expect(response.body).toBeTruthy();
    });

    it('GET /api/export/midi/:sessionId should return 404 for non-existent session', async () => {
      await request(mockApp)
        .get('/api/export/midi/nonexistentsession')
        .expect(404);
    });
  });
});
