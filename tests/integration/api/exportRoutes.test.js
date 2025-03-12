// tests/integration/api/exportRoutes.test.js
const request = require('supertest');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../testSetup');

let app;

describe('Export/Import API Integration Tests', () => {
  let sessionId;
  let sessionData;

  // Set up the in-memory database before all tests
  beforeAll(async () => {
    await setupTestDB();
    
    // Import the app after database connection is established
    app = require('../../../src/server/app');
  });

  // Clear the database between tests
  beforeEach(async () => {
    await clearDatabase();
  });

  // Close database connection after all tests
  afterAll(async () => {
    await teardownTestDB();
  });

  // Create a test session before each test suite
  beforeEach(async () => {
    // Create a session
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Export Test Session',
        bpm: 120,
        timeSignature: [4, 4],
        author: 'Test User'
      });

    // Debug logging
    console.log('Session creation response:', sessionResponse.body);
    
    // Get session ID (handle different API response formats)
    sessionId = sessionResponse.body._id || sessionResponse.body.id || sessionResponse.body.sessionId;
    
    if (!sessionId && sessionResponse.body) {
      const bodyKeys = Object.keys(sessionResponse.body);
      if (bodyKeys.length > 0) {
        sessionId = sessionResponse.body[bodyKeys[0]];
      }
    }
    
    expect(sessionId).toBeTruthy();

    // Add some music data to the session
    await request(app)
      .post(`/api/sessions/${sessionId}/notes`)
      .send({
        pitch: 60,   // Middle C
        startTime: 0,
        duration: 1,
        velocity: 80,
        trackId: 0
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

    beforeEach(async () => {
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
