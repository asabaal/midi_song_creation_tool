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
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Test Session');
      expect(response.body.tempo).toBe(140);
      expect(response.body.timeSignature).toBe('3/4');
      expect(response.body.author).toBe('Test User');
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
      expect(response.body.error).toContain('name');
    });
  });
  
  describe('GET /api/sessions', () => {
    it('should return a list of sessions', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/sessions/:id', () => {
    it('should return a specific session by ID', async () => {
      const response = await request(app)
        .get(`/api/sessions/${testSession.id}`)
        .expect('Content-Type', /json/)
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
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', testSession.id);
      expect(response.body.name).toBe('Updated Session Name');
      expect(response.body.tempo).toBe(150);
      expect(response.body.timeSignature).toBe('6/8');
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
  
  describe('POST /api/sessions/:id/tracks', () => {
    it('should add a track to a session', async () => {
      const trackData = {
        name: 'Piano Track',
        instrument: 'piano'
      };
      
      const response = await request(app)
        .post(`/api/sessions/${testSession.id}/tracks`)
        .send(trackData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Piano Track');
      expect(response.body.instrument).toBe('piano');
    });
    
    it('should validate track data', async () => {
      const invalidTrackData = {
        name: 'Piano Track'
        // Missing instrument
      };
      
      await request(app)
        .post(`/api/sessions/${testSession.id}/tracks`)
        .send(invalidTrackData)
        .expect(400);
    });
  });
  
  describe('PUT /api/sessions/:id/tracks/:trackId', () => {
    let trackId;
    
    beforeEach(async () => {
      // Create a track to update
      const trackResponse = await request(app)
        .post(`/api/sessions/${testSession.id}/tracks`)
        .send({
          name: 'Piano Track',
          instrument: 'piano'
        });
      
      trackId = trackResponse.body.id;
    });
    
    it('should update a track in a session', async () => {
      const updatedTrackData = {
        name: 'Updated Piano Track',
        instrument: 'electric_piano'
      };
      
      const response = await request(app)
        .put(`/api/sessions/${testSession.id}/tracks/${trackId}`)
        .send(updatedTrackData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', trackId);
      expect(response.body.name).toBe('Updated Piano Track');
      expect(response.body.instrument).toBe('electric_piano');
    });
  });
  
  describe('DELETE /api/sessions/:id/tracks/:trackId', () => {
    let trackId;
    
    beforeEach(async () => {
      // Create a track to delete
      const trackResponse = await request(app)
        .post(`/api/sessions/${testSession.id}/tracks`)
        .send({
          name: 'Piano Track',
          instrument: 'piano'
        });
      
      trackId = trackResponse.body.id;
    });
    
    it('should delete a track from a session', async () => {
      await request(app)
        .delete(`/api/sessions/${testSession.id}/tracks/${trackId}`)
        .expect(204);
      
      // TODO: Verify track was removed
    });
  });
});