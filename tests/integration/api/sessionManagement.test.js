// tests/integration/api/sessionManagement.test.js
const request = require('supertest');
const { app } = require('../testSetup');

describe('Session Management API Integration Tests', () => {
  let testSession;
  
  beforeEach(async () => {
    // Create a test session before each test
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Test Session',
        tempo: 120,
        timeSignature: '4/4',
        author: 'Test User'
      });
    
    testSession = sessionResponse.body;
  });
  
  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'New Test Session',
          tempo: 140,
          timeSignature: '3/4',
          author: 'Test User'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Test Session');
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          tempo: 140,
          timeSignature: '3/4',
          author: 'Test User'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/sessions', () => {
    it('should return a list of sessions', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/sessions/:id', () => {
    it('should return a specific session by ID', async () => {
      const response = await request(app)
        .get(`/api/sessions/${testSession.id}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', testSession.id);
      expect(response.body.name).toBe(testSession.name);
    });
    
    it('should return 404 for non-existent session ID', async () => {
      await request(app)
        .get('/api/sessions/non-existent-id')
        .expect(404);
    });
  });
  
  describe('PUT /api/sessions/:id', () => {
    it('should update a session', async () => {
      const response = await request(app)
        .put(`/api/sessions/${testSession.id}`)
        .send({
          name: 'Updated Session Name',
          tempo: 150,
          timeSignature: '6/8',
          author: 'Test User'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('id', testSession.id);
      expect(response.body.name).toBe('Updated Session Name');
    });
    
    it('should return 404 for non-existent session ID', async () => {
      await request(app)
        .put('/api/sessions/non-existent-id')
        .send({
          name: 'Updated Session Name'
        })
        .expect(404);
    });
  });
  
  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session', async () => {
      await request(app)
        .delete(`/api/sessions/${testSession.id}`)
        .expect(204);
      
      // Verify it's gone
      await request(app)
        .get(`/api/sessions/${testSession.id}`)
        .expect(404);
    });
    
    it('should return 404 for non-existent session ID', async () => {
      await request(app)
        .delete('/api/sessions/non-existent-id')
        .expect(404);
    });
  });
});