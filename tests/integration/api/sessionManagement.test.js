const request = require('supertest');
const { mockApp } = require('../testSetup');

describe('Session Management API Integration Tests', () => {
  let sessionId;
  
  beforeEach(async () => {
    // Create a test session before each test
    const sessionResponse = await request(mockApp)
      .post('/api/sessions')
      .send({
        name: 'Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });
    
    sessionId = sessionResponse.body.id;
  });
  
  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const response = await request(mockApp)
        .post('/api/sessions')
        .send({
          name: 'New Test Session',
          tempo: 110,
          timeSignature: '3/4'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Test Session');
      expect(response.body).toHaveProperty('tempo', 110);
      expect(response.body).toHaveProperty('timeSignature', '3/4');
    });
    
    it('should validate required fields', async () => {
      await request(mockApp)
        .post('/api/sessions')
        .send({
          requireName: true,  // This will trigger validation in the mock
          tempo: 120
        })
        .expect(400);
    });
  });
  
  describe('GET /api/sessions', () => {
    it('should return a list of sessions', async () => {
      const response = await request(mockApp)
        .get('/api/sessions')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify first session in the list
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('tempo');
      }
    });
  });
  
  describe('GET /api/sessions/:id', () => {
    it('should return a specific session by ID', async () => {
      const response = await request(mockApp)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Test Session');
      expect(response.body).toHaveProperty('tempo', 120);
      expect(response.body).toHaveProperty('timeSignature', '4/4');
    });
    
    it('should return 404 for non-existent session ID', async () => {
      await request(mockApp)
        .get('/api/sessions/nonexistentid')
        .expect(404);
    });
  });
  
  describe('PUT /api/sessions/:id', () => {
    it('should update a session', async () => {
      const response = await request(mockApp)
        .put(`/api/sessions/${sessionId}`)
        .send({
          name: 'Updated Test Session',
          tempo: 140
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Updated Test Session');
      expect(response.body).toHaveProperty('tempo', 140);
      expect(response.body).toHaveProperty('timeSignature', '4/4'); // Unchanged value
    });
    
    it('should return 404 for non-existent session ID', async () => {
      await request(mockApp)
        .put('/api/sessions/nonexistentid')
        .send({
          name: 'Updated Session'
        })
        .expect(404);
    });
  });
  
  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session', async () => {
      // First delete the session
      await request(mockApp)
        .delete(`/api/sessions/${sessionId}`)
        .expect(204);
      
      // Then try to retrieve it - should return 404
      await request(mockApp)
        .get(`/api/sessions/${sessionId}`)
        .expect(404);
    });
    
    it('should return 404 for non-existent session ID', async () => {
      await request(mockApp)
        .delete('/api/sessions/nonexistentid')
        .expect(404);
    });
  });
});
