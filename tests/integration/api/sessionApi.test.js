// tests/integration/api/sessionApi.test.js
const request = require('supertest');
const app = require('../../../src/server/app');
const { setupTestDb, teardownTestDb } = require('../../fixtures/mock-data/db-setup');

describe('Session API', () => {
  // Setup and teardown for the test database
  beforeAll(async () => {
    await setupTestDb();
  });
  
  afterAll(async () => {
    await teardownTestDb();
  });
  
  describe('POST /api/sessions', () => {
    test('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Test Session',
          bpm: 120,
          timeSignature: [4, 4]
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Session');
      expect(response.body.bpm).toBe(120);
      expect(response.body.timeSignature).toEqual([4, 4]);
    });
    
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          // Missing required fields
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/sessions', () => {
    test('should retrieve all sessions', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    test('should support filtering by date', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .query({ from: new Date().toISOString() })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      // Expect no results for future date
      expect(response.body.length).toBe(0);
    });
  });
  
  describe('GET /api/sessions/:id', () => {
    let sessionId;
    
    // Create a session to test with
    beforeAll(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Retrieve Test Session',
          bpm: 100,
          timeSignature: [3, 4]
        });
      
      sessionId = response.body.id;
    });
    
    test('should retrieve a session by ID', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body.name).toBe('Retrieve Test Session');
    });
    
    test('should return 404 for non-existent session', async () => {
      await request(app)
        .get('/api/sessions/nonexistentid')
        .expect(404);
    });
  });
  
  describe('PUT /api/sessions/:id', () => {
    let sessionId;
    
    // Create a session to test with
    beforeAll(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Update Test Session',
          bpm: 90,
          timeSignature: [4, 4]
        });
      
      sessionId = response.body.id;
    });
    
    test('should update a session', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .send({
          name: 'Updated Session Name',
          bpm: 100
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body.name).toBe('Updated Session Name');
      expect(response.body.bpm).toBe(100);
      // Unchanged properties should remain
      expect(response.body.timeSignature).toEqual([4, 4]);
    });
  });
  
  describe('DELETE /api/sessions/:id', () => {
    let sessionId;
    
    // Create a session to test with
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Delete Test Session',
          bpm: 120,
          timeSignature: [4, 4]
        });
      
      sessionId = response.body.id;
    });
    
    test('should delete a session', async () => {
      await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .expect(204);
      
      // Verify it's deleted
      await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(404);
    });
  });
});