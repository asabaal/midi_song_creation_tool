const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../testSetup');

describe('Export/Import API Integration Tests', () => {
  let testSessionId;
  
  beforeEach(async () => {
    // Create a test session for each test
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Export Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });
    
    testSessionId = sessionResponse.body.id || sessionResponse.body._id;
  });

  test('GET /api/export/json/:sessionId should export session data as JSON', async () => {
    // Export session as JSON
    const exportResponse = await request(app)
      .get(`/api/export/json/${testSessionId}`);

    expect(exportResponse.status).toBe(200);
    expect(exportResponse.body.name).toBe('Export Test Session');
    expect(exportResponse.body.tempo).toBe(120);
  });

  test('GET /api/export/json/:sessionId should return 404 for non-existent session', async () => {
    const exportResponse = await request(app)
      .get('/api/export/json/non-existent-id');

    expect(exportResponse.status).toBe(404);
  });

  test('GET /api/export/midi/:sessionId should export session as MIDI file', async () => {
    // Export session as MIDI
    const exportResponse = await request(app)
      .get(`/api/export/midi/${testSessionId}`);

    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers['content-type']).toMatch(/application\/octet-stream/);
  });

  test('GET /api/export/midi/:sessionId should return 404 for non-existent session', async () => {
    const exportResponse = await request(app)
      .get('/api/export/midi/non-existent-id');

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
    expect(importResponse.body.name).toBe('Import Test Session');
    expect(importResponse.body.tempo).toBe(110);
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
    expect(importResponse.body.name).toBe('String Import Test');
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
