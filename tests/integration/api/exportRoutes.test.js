const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const dbHandler = require('../setupTestDB');

describe('Export/Import API Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  test('GET /api/export/json/:sessionId should export session data as JSON', async () => {
    // Create a session
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Export Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    expect(sessionResponse.status).toBe(201);
    const sessionId = sessionResponse.body._id;

    // Export session as JSON
    const exportResponse = await request(app)
      .get(`/api/export/json/${sessionId}`);

    expect(exportResponse.status).toBe(200);
    expect(exportResponse.body).toHaveProperty('name', 'Export Test Session');
    expect(exportResponse.body).toHaveProperty('tempo', 120);
  });

  test('GET /api/export/json/:sessionId should return 404 for non-existent session', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const exportResponse = await request(app)
      .get(`/api/export/json/${nonExistentId}`);

    expect(exportResponse.status).toBe(404);
  });

  test('GET /api/export/midi/:sessionId should export session as MIDI file', async () => {
    // Create a session
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Export Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    expect(sessionResponse.status).toBe(201);
    const sessionId = sessionResponse.body._id;

    // Export session as MIDI
    const exportResponse = await request(app)
      .get(`/api/export/midi/${sessionId}`);

    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers['content-type']).toMatch(/application\/octet-stream/);
  });

  test('GET /api/export/midi/:sessionId should return 404 for non-existent session', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const exportResponse = await request(app)
      .get(`/api/export/midi/${nonExistentId}`);

    expect(exportResponse.status).toBe(404);
  });

  test('POST /api/export/import should import session data from JSON', async () => {
    // Create a sample session
    const sessionData = {
      name: 'Import Test Session',
      tempo: 110,
      timeSignature: '3/4',
      notes: [
        { pitch: 60, velocity: 100, startTime: 0, duration: 0.5 }
      ]
    };

    // Import the session
    const importResponse = await request(app)
      .post('/api/export/import')
      .send(sessionData);

    expect(importResponse.status).toBe(201);
    expect(importResponse.body).toHaveProperty('_id');
    expect(importResponse.body).toHaveProperty('name', 'Import Test Session');
    expect(importResponse.body).toHaveProperty('tempo', 110);
  });

  test('POST /api/export/import should handle importing a string JSON representation', async () => {
    // Create a sample session as a JSON string
    const sessionDataStr = JSON.stringify({
      name: 'String Import Test',
      tempo: 95,
      timeSignature: '4/4'
    });

    // Import the session
    const importResponse = await request(app)
      .post('/api/export/import')
      .set('Content-Type', 'application/json')
      .send(sessionDataStr);

    expect(importResponse.status).toBe(201);
    expect(importResponse.body).toHaveProperty('name', 'String Import Test');
  });

  test('POST /api/export/import should reject invalid JSON data', async () => {
    // Send invalid data
    const importResponse = await request(app)
      .post('/api/export/import')
      .send('This is not JSON');

    expect(importResponse.status).toBe(400);
  });

  test('POST /api/export/import should reject empty data', async () => {
    // Send empty data
    const importResponse = await request(app)
      .post('/api/export/import')
      .send({});

    expect(importResponse.status).toBe(400);
  });
});
