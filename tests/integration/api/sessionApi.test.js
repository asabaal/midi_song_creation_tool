// tests/integration/api/sessionApi.test.js
const request = require('supertest');
const { app } = require('../testSetup');

describe('Session API', () => {
  describe('POST /api/sessions', () => {
    test('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Test Session',
          tempo: 120, // Changed from bpm to tempo to match the mock API
          timeSignature: '4/4', // Changed format to match the mock API
          author: 'Test User'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Session');
      
      // In our mock, we use tempo instead of bpm
      expect(response.body.tempo).toBe(120);
    });
    
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          // Missing required name field
          tempo: 120,
          timeSignature: '4/4'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/sessions', () => {
    // Add sessions before testing retrieval
    beforeEach(async () => {
      await request(app)
        .post('/api/sessions')
        .send({
          name: 'Session 1',
          tempo: 120,
          timeSignature: '4/4',
          author: 'Test User'
        });
      
      await request(app)
        .post('/api/sessions')
        .send({
          name: 'Session 2',
          tempo: 140,
          timeSignature: '3/4',
          author: 'Another User'
        });
    });
    
    test('should retrieve all sessions', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('GET /api/sessions/:id', () => {
    let sessionId;
    
    // Create a session before each test
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Retrieve Test Session',
          tempo: 100,
          timeSignature: '3/4',
          author: 'Test User'
        });
      
      sessionId = response.body.id;
      expect(sessionId).toBeTruthy();
    });
    
    test('should retrieve a session by ID', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
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
    
    // Create a session before each test
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Update Test Session',
          tempo: 90,
          timeSignature: '4/4',
          author: 'Test User'
        });
      
      sessionId = response.body.id;
      expect(sessionId).toBeTruthy();
    });
    
    test('should update a session', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .send({
          name: 'Updated Session Name',
          tempo: 100
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body.name).toBe('Updated Session Name');
      // Use tempo instead of bpm
      expect(response.body.tempo).toBe(100);
    });
  });
  
  describe('DELETE /api/sessions/:id', () => {
    let sessionId;
    
    // Create a session before each test
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Delete Test Session',
          tempo: 120,
          timeSignature: '4/4',
          author: 'Test User'
        });
      
      sessionId = response.body.id;
      expect(sessionId).toBeTruthy();
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