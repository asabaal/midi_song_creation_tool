// tests/integration/api/sessionApi.test.js
const request = require('supertest');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../utils/testDB');
const apiMockSetup = require('./apiMockSetup');

// Use the mock API directly
const app = apiMockSetup();

describe('Session API', () => {
  // Setup and teardown for the test database
  beforeAll(async () => {
    await setupTestDB();
  });
  
  // Clear the database between tests
  beforeEach(async () => {
    await clearDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDB();
  });
  
  describe('POST /api/sessions', () => {
    test('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Test Session',
          bpm: 120,
          timeSignature: [4, 4],
          author: 'Test User'
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
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/sessions', () => {
    // Add a couple of sessions before testing retrieval
    beforeEach(async () => {
      await request(app)
        .post('/api/sessions')
        .send({
          name: 'Session 1',
          bpm: 120,
          timeSignature: [4, 4],
          author: 'Test User'
        });
      
      await request(app)
        .post('/api/sessions')
        .send({
          name: 'Session 2',
          bpm: 140,
          timeSignature: [3, 4],
          author: 'Another User'
        });
    });
    
    test('should retrieve all sessions', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .expect('Content-Type', /json/)
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
          bpm: 100,
          timeSignature: [3, 4],
          author: 'Test User'
        });
      
      sessionId = response.body.id;
      expect(sessionId).toBeTruthy();
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
    
    // Create a session before each test
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Update Test Session',
          bpm: 90,
          timeSignature: [4, 4],
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
    
    // Create a session before each test
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Delete Test Session',
          bpm: 120,
          timeSignature: [4, 4],
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