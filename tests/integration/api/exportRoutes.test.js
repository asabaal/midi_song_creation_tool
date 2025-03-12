// tests/integration/api/exportRoutes.test.js
const request = require('supertest');
const app = require('../../../src/server/app');

describe('Export/Import API Integration Tests', () => {
  let sessionId;
  let sessionData;

  // Create a session and add data before tests
  beforeAll(async () => {
    // Create a session
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Export Test Session',
        bpm: 120,
        timeSignature: [4, 4]
      });

    sessionId = sessionResponse.body._id || sessionResponse.body.id;
    expect(sessionId).toBeTruthy();

    // Add some music data to the session
    await request(app)
      .post(`/api/sessions/${sessionId}/patterns/chord-progression`)
      .send({
        key: 'C',
        progressionName: '1-4-5',
        scaleType: 'major',
        octave: 4
      });

    // Get the session data for later comparison
    const dataResponse = await request(app)
      .get(`/api/sessions/${sessionId}`);
    
    sessionData = dataResponse.body;
  });

  describe('GET /api/export/json/:sessionId', () => {
    it('should export session data as JSON', async () => {
      const response = await request(app)
        .get(`/api/export/json/${sessionId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Exported');
      expect(response.body).toHaveProperty('sessionId', sessionId);
      expect(response.body).toHaveProperty('data');
      
      // Check that the data matches what we expect
      expect(response.body.data).toHaveProperty('name', 'Export Test Session');
      expect(response.body.data).toHaveProperty('bpm', 120);
      expect(response.body.data).toHaveProperty('tracks');
      expect(response.body.data.tracks).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .get('/api/export/json/nonexistentsession')
        .expect(404);
    });
  });

  describe('GET /api/export/midi/:sessionId', () => {
    it('should export session as MIDI file', async () => {
      const response = await request(app)
        .get(`/api/export/midi/${sessionId}`)
        .expect('Content-Type', /midi/)
        .expect('Content-Disposition', /attachment/)
        .expect(200);

      // Verify we got binary data
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .get('/api/export/midi/nonexistentsession')
        .expect(404);
    });
  });

  describe('POST /api/export/import', () => {
    let exportedData;

    beforeAll(async () => {
      // Get exported data to use for import test
      const response = await request(app)
        .get(`/api/export/json/${sessionId}`);
      
      exportedData = response.body.data;
    });

    it('should import session data from JSON', async () => {
      const response = await request(app)
        .post('/api/export/import')
        .send({
          data: exportedData,
          name: 'Imported Session'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Session imported');
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('name', 'Imported Session');
      
      // Verify the imported session has tracks and notes
      expect(response.body.session).toHaveProperty('trackCount');
      expect(response.body.session.trackCount).toBeGreaterThan(0);
      expect(response.body.session).toHaveProperty('noteCount');
      expect(response.body.session.noteCount).toBeGreaterThan(0);
    });

    it('should handle importing a string JSON representation', async () => {
      const response = await request(app)
        .post('/api/export/import')
        .send({
          data: JSON.stringify(exportedData),
          name: 'String Imported Session'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('sessionId');
    });

    it('should reject invalid JSON data', async () => {
      await request(app)
        .post('/api/export/import')
        .send({
          data: "{ invalid json data }"
        })
        .expect(400);
    });

    it('should reject empty data', async () => {
      await request(app)
        .post('/api/export/import')
        .send({})
        .expect(400);
    });
  });
});
