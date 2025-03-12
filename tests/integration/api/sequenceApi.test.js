// tests/integration/api/sequenceApi.test.js
const request = require('supertest');
const { app } = require('../testSetup');

describe('Sequence API', () => {
  let sessionId;
  
  // Create a test session before tests
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
  
  describe('POST /api/sessions/:id/notes', () => {
    test('should add a note to a sequence', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          trackId: 0,
          pitch: 60,
          start: 0,
          duration: 1,
          velocity: 100
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
    
    test('should validate note properties', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          trackId: 0,
          // Missing required pitch
          start: 0,
          duration: 1
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('PUT /api/sessions/:id/notes/:noteId', () => {
    let noteId;
    
    beforeEach(async () => {
      // Add a note to update
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          trackId: 0,
          pitch: 62,
          start: 2,
          duration: 1,
          velocity: 90
        });
      
      noteId = response.body.id;
    });
    
    test('should update a note', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}/notes/${noteId}`)
        .send({
          pitch: 64,
          duration: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });
  
  describe('DELETE /api/sessions/:id/notes/:noteId', () => {
    let noteId;
    
    beforeEach(async () => {
      // Add a note to delete
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          trackId: 0,
          pitch: 65,
          start: 3,
          duration: 1,
          velocity: 80
        });
      
      noteId = response.body.id;
    });
    
    test('should delete a note', async () => {
      await request(app)
        .delete(`/api/sessions/${sessionId}/notes/${noteId}`)
        .expect(204);
    });
  });
  
  describe('POST /api/sessions/:id/patterns', () => {
    test('should generate a chord pattern', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          root: 'C',
          chordType: 'major',
          octave: 4,
          trackId: 1
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('notes');
    });
    
    test('should generate a bassline pattern', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'bassline',
          patternType: 'walking',
          key: 'C',
          octave: 3,
          trackId: 2
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('notes');
    });
    
    test('should generate a drum pattern', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'drum',
          patternType: 'basic',
          bars: 2,
          trackId: 9 // Standard MIDI drum channel
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('notes');
    });
  });
  
  describe('PUT /api/sessions/:id/transport', () => {
    test('should update transport settings', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}/transport`)
        .send({
          bpm: 140,
          timeSignature: [3, 4],
          loop: {
            enabled: true,
            start: 0,
            end: 8
          }
        });
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('GET /api/sessions/:id/export/midi', () => {
    test('should export session as MIDI file', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}/export/midi`);
      
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/audio\/midi/);
    });
  });
});