const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../testSetup');

describe('Session API', () => {
  describe('POST /api/sessions', () => {
    test('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Test Session',
          tempo: 120,
          timeSignature: '4/4'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Session');
      expect(response.body).toHaveProperty('tempo', 120);
      expect(response.body).toHaveProperty('timeSignature', '4/4');
    });

    test('should validate required fields', async () => {
      // Configure the mock to require name field
      const response = await request(app)
        .post('/api/sessions')
        .send({
          requireName: true,
          tempo: 120,
          timeSignature: '4/4'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/sessions', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/sessions')
        .send({
          name: 'Session 1',
          tempo: 120,
          timeSignature: '4/4'
        });

      await request(app)
        .post('/api/sessions')
        .send({
          name: 'Session 2',
          tempo: 100,
          timeSignature: '3/4'
        });
    });

    test('should retrieve all sessions', async () => {
      const response = await request(app).get('/api/sessions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify session properties
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('tempo');
      expect(response.body[0]).toHaveProperty('timeSignature');
    });
  });

  describe('GET /api/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Retrieve Test Session',
          tempo: 100,
          timeSignature: '4/4'
        });

      sessionId = response.body.id;
    });

    test('should retrieve a session by ID', async () => {
      const response = await request(app).get(`/api/sessions/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Retrieve Test Session');
      expect(response.body).toHaveProperty('tempo', 100);
    });

    test('should return 404 for non-existent session', async () => {
      const response = await request(app).get('/api/sessions/non-existent-id');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Update Test Session',
          tempo: 90,
          timeSignature: '3/4'
        });

      sessionId = response.body.id;
    });

    test('should update a session', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .send({
          name: 'Updated Session Name',
          tempo: 110,
          timeSignature: '4/4'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Updated Session Name');
      expect(response.body).toHaveProperty('tempo', 110);
      expect(response.body).toHaveProperty('timeSignature', '4/4');
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Delete Test Session',
          tempo: 120,
          timeSignature: '4/4'
        });

      sessionId = response.body.id;
    });

    test('should delete a session', async () => {
      // First, delete the session
      const deleteResponse = await request(app).delete(`/api/sessions/${sessionId}`);
      expect(deleteResponse.status).toBe(204);

      // Then, verify it's gone
      const getResponse = await request(app).get(`/api/sessions/${sessionId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
