// tests/integration/api/sessionManagement.test.js
const request = require('supertest');
const app = require('../../../src/server/app');
const fs = require('fs');
const path = require('path');

// Create a sessions data directory for tests if it doesn't exist
const testSessionsDir = path.join(__dirname, '../../../test-sessions');
if (!fs.existsSync(testSessionsDir)) {
  fs.mkdirSync(testSessionsDir, { recursive: true });
}

describe('Session Management API Integration Tests', () => {
  // Cleanup after tests
  afterAll(() => {
    // Clean up test session files
    if (fs.existsSync(testSessionsDir)) {
      const files = fs.readdirSync(testSessionsDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(testSessionsDir, file));
        }
      });
    }
  });

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Test Session',
          author: 'Test User'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Session');
      expect(response.body).toHaveProperty('author', 'Test User');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('tracks', []);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          // Missing name
          author: 'Test User'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name');
    });
  });

  describe('GET /api/sessions', () => {
    it('should return a list of sessions', async () => {
      // Create a session first
      await request(app)
        .post('/api/sessions')
        .send({
          name: 'List Test Session',
          author: 'Test User'
        });

      // Get all sessions
      const response = await request(app)
        .get('/api/sessions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if our session is in the list
      const found = response.body.some(session => session.name === 'List Test Session');
      expect(found).toBe(true);
    });
  });

  describe('GET /api/sessions/:id', () => {
    let sessionId;

    beforeAll(async () => {
      // Create a session to get
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Get Test Session',
          author: 'Test User'
        });

      sessionId = response.body.id;
    });

    it('should return a specific session by ID', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Get Test Session');
    });

    it('should return 404 for non-existent session ID', async () => {
      await request(app)
        .get('/api/sessions/non-existent-id')
        .expect(404);
    });
  });

  describe('PUT /api/sessions/:id', () => {
    let sessionId;

    beforeAll(async () => {
      // Create a session to update
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Update Test Session',
          author: 'Test User'
        });

      sessionId = response.body.id;
    });

    it('should update a session', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .send({
          name: 'Updated Session Name',
          author: 'Test User'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', sessionId);
      expect(response.body).toHaveProperty('name', 'Updated Session Name');
    });

    it('should return 404 for non-existent session ID', async () => {
      await request(app)
        .put('/api/sessions/non-existent-id')
        .send({
          name: 'Updated Session Name',
          author: 'Test User'
        })
        .expect(404);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a session to delete
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Delete Test Session',
          author: 'Test User'
        });

      sessionId = response.body.id;
    });

    it('should delete a session', async () => {
      await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .expect(204);

      // Verify it's gone
      await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(404);
    });

    it('should return 404 for non-existent session ID', async () => {
      await request(app)
        .delete('/api/sessions/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/sessions/:id/tracks', () => {
    let sessionId;

    beforeAll(async () => {
      // Create a session
      const response = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Track Test Session',
          author: 'Test User'
        });

      sessionId = response.body.id;
    });

    it('should add a track to a session', async () => {
      const trackData = {
        name: 'Test Track',
        type: 'melody',
        instrument: 0,
        notes: [
          { pitch: 60, startTime: 0, duration: 1, velocity: 100 }
        ]
      };

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/tracks`)
        .send(trackData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Track');
      expect(response.body).toHaveProperty('type', 'melody');
      expect(response.body.notes).toHaveLength(1);

      // Verify track was added to session
      const sessionResponse = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(sessionResponse.body.tracks).toHaveLength(1);
      expect(sessionResponse.body.tracks[0].name).toBe('Test Track');
    });

    it('should validate track data', async () => {
      const invalidTrackData = {
        // Missing name
        type: 'melody',
        instrument: 0,
        notes: []
      };

      await request(app)
        .post(`/api/sessions/${sessionId}/tracks`)
        .send(invalidTrackData)
        .expect(400);
    });
  });

  describe('PUT /api/sessions/:id/tracks/:trackId', () => {
    let sessionId;
    let trackId;

    beforeAll(async () => {
      // Create a session
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Track Update Test Session',
          author: 'Test User'
        });

      sessionId = sessionResponse.body.id;

      // Add a track
      const trackResponse = await request(app)
        .post(`/api/sessions/${sessionId}/tracks`)
        .send({
          name: 'Track to Update',
          type: 'melody',
          instrument: 0,
          notes: []
        });

      trackId = trackResponse.body.id;
    });

    it('should update a track in a session', async () => {
      const updatedTrackData = {
        name: 'Updated Track Name',
        type: 'melody',
        instrument: 1,
        notes: [
          { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
          { pitch: 62, startTime: 1, duration: 1, velocity: 100 }
        ]
      };

      const response = await request(app)
        .put(`/api/sessions/${sessionId}/tracks/${trackId}`)
        .send(updatedTrackData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', trackId);
      expect(response.body).toHaveProperty('name', 'Updated Track Name');
      expect(response.body).toHaveProperty('instrument', 1);
      expect(response.body.notes).toHaveLength(2);
    });
  });

  describe('DELETE /api/sessions/:id/tracks/:trackId', () => {
    let sessionId;
    let trackId;

    beforeAll(async () => {
      // Create a session
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Track Delete Test Session',
          author: 'Test User'
        });

      sessionId = sessionResponse.body.id;

      // Add a track
      const trackResponse = await request(app)
        .post(`/api/sessions/${sessionId}/tracks`)
        .send({
          name: 'Track to Delete',
          type: 'melody',
          instrument: 0,
          notes: []
        });

      trackId = trackResponse.body.id;
    });

    it('should delete a track from a session', async () => {
      await request(app)
        .delete(`/api/sessions/${sessionId}/tracks/${trackId}`)
        .expect(204);

      // Verify track was removed
      const sessionResponse = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(sessionResponse.body.tracks).toHaveLength(0);
    });
  });
});
