const request = require('supertest');
const { app } = require('../testSetup');

describe('Sequence API', () => {
  let sessionId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/sessions')
      .send({
        name: 'Sequence API Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    sessionId = response.body.id;
  });

  test('POST /api/sessions/:id/notes should add a note to a sequence', async () => {
    const response = await request(app)
      .post(`/api/sessions/${sessionId}/notes`)
      .send({
        pitch: 60,
        start: 0,
        duration: 1,
        velocity: 100
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('pitch', 60);
    expect(response.body).toHaveProperty('duration', 1);
  });

  test('POST /api/sessions/:id/notes should validate note properties', async () => {
    const response = await request(app)
      .post(`/api/sessions/${sessionId}/notes`)
      .send({
        // Missing required pitch
        start: 0,
        duration: 1
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  test('PUT /api/sessions/:id/notes/:noteId should update a note', async () => {
    // First, add a note
    const createResponse = await request(app)
      .post(`/api/sessions/${sessionId}/notes`)
      .send({
        pitch: 60,
        start: 0,
        duration: 1,
        velocity: 100
      });

    const noteId = createResponse.body.id;

    // Then update it
    const updateResponse = await request(app)
      .put(`/api/sessions/${sessionId}/notes/${noteId}`)
      .send({
        pitch: 64,
        start: 1,
        duration: 0.5
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty('id', noteId);
    expect(updateResponse.body).toHaveProperty('pitch', 64);
    expect(updateResponse.body).toHaveProperty('start', 1);
    expect(updateResponse.body).toHaveProperty('duration', 0.5);
  });

  test('DELETE /api/sessions/:id/notes/:noteId should delete a note', async () => {
    // First, add a note
    const createResponse = await request(app)
      .post(`/api/sessions/${sessionId}/notes`)
      .send({
        pitch: 60,
        start: 0,
        duration: 1,
        velocity: 100
      });

    const noteId = createResponse.body.id;

    // Then delete it
    await request(app)
      .delete(`/api/sessions/${sessionId}/notes/${noteId}`)
      .expect(204);
  });

  test('POST /api/sessions/:id/patterns should generate a chord pattern', async () => {
    const response = await request(app)
      .post(`/api/sessions/${sessionId}/patterns`)
      .send({
        patternType: 'chord',
        rootNote: 'C',
        chordType: 'major',
        bars: 1
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('notes');
    expect(Array.isArray(response.body.notes)).toBe(true);
  });

  test('POST /api/sessions/:id/patterns should generate a bassline pattern', async () => {
    const response = await request(app)
      .post(`/api/sessions/${sessionId}/patterns`)
      .send({
        patternType: 'bassline',
        rootNote: 'C',
        chordProgression: ['C', 'F', 'G'],
        bars: 2
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('notes');
    expect(Array.isArray(response.body.notes)).toBe(true);
  });

  test('POST /api/sessions/:id/patterns should generate a drum pattern', async () => {
    const response = await request(app)
      .post(`/api/sessions/${sessionId}/patterns`)
      .send({
        patternType: 'drum',
        drumStyle: 'basic',
        bars: 1
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('notes');
    expect(Array.isArray(response.body.notes)).toBe(true);
  });

  test('PUT /api/sessions/:id/transport should update transport settings', async () => {
    const response = await request(app)
      .put(`/api/sessions/${sessionId}/transport`)
      .send({
        bpm: 140,
        timeSignature: '3/4',
        loop: true
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('bpm', 140);
    expect(response.body).toHaveProperty('timeSignature', '3/4');
    expect(response.body).toHaveProperty('loop', true);
  });

  test('GET /api/sessions/:id/export/midi should export session as MIDI file', async () => {
    const response = await request(app)
      .get(`/api/sessions/${sessionId}/export/midi`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/octet-stream/);
    expect(response.headers['content-disposition']).toMatch(/attachment/);
  });
});
