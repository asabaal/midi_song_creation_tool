// tests/integration/api/sequenceApi.test.js
const request = require('supertest');
const app = require('../../../src/server/app');
const { setupTestDb, teardownTestDb, createTestSession } = require('../../fixtures/mock-data/db-setup');
const fs = require('fs');
const path = require('path');

describe('Sequence API', () => {
  let sessionId;
  
  // Setup test database and create a test session
  beforeAll(async () => {
    await setupTestDb();
    sessionId = await createTestSession('Sequence API Test Session');
  });
  
  afterAll(async () => {
    await teardownTestDb();
  });
  
  describe('POST /api/sessions/:id/notes', () => {
    test('should add a note to a sequence', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          trackId: 0,
          pitch: 60,
          startTime: 0,
          duration: 1,
          velocity: 100
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.pitch).toBe(60);
    });
    
    test('should validate note properties', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          trackId: 0,
          // Missing required pitch
          startTime: 0,
          duration: 1
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
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
          startTime: 2,
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
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', noteId);
      expect(response.body.pitch).toBe(64);
      expect(response.body.duration).toBe(2);
      // Unchanged properties should remain
      expect(response.body.startTime).toBe(2);
      expect(response.body.velocity).toBe(90);
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
          startTime: 3,
          duration: 1,
          velocity: 80
        });
      
      noteId = response.body.id;
    });
    
    test('should delete a note', async () => {
      await request(app)
        .delete(`/api/sessions/${sessionId}/notes/${noteId}`)
        .expect(204);
      
      // Verify note no longer exists by trying to update it
      await request(app)
        .put(`/api/sessions/${sessionId}/notes/${noteId}`)
        .send({ pitch: 67 })
        .expect(404);
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
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBeGreaterThan(0);
    });
    
    test('should generate a bassline pattern', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'bassline',
          roots: [60, 67, 65, 60], // C G F C progression
          style: 'walking',
          octave: 3,
          trackId: 2
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBeGreaterThan(0);
    });
    
    test('should generate a drum pattern', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'drum',
          bars: 2,
          style: 'basic',
          timeSignature: [4, 4],
          trackId: 9 // Standard MIDI drum channel
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBeGreaterThan(0);
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
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.bpm).toBe(140);
      expect(response.body.timeSignature).toEqual([3, 4]);
      expect(response.body.loop.enabled).toBe(true);
    });
  });
  
  describe('GET /api/sessions/:id/export/midi', () => {
    test('should export session as MIDI file', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}/export/midi`)
        .expect('Content-Type', /midi/)
        .expect('Content-Disposition', /attachment/)
        .expect(200);
      
      // Check if response contains MIDI data
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('POST /api/sessions/:id/import/midi', () => {
    test('should import MIDI file into session', async () => {
      // Use a test MIDI file from fixtures
      const midiFilePath = path.join(__dirname, '../../fixtures/midi/test-pattern.mid');
      const midiData = fs.readFileSync(midiFilePath);
      
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/import/midi`)
        .attach('midiFile', midiData, 'test-pattern.mid')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('tracks');
      expect(response.body.tracks.length).toBeGreaterThan(0);
      expect(response.body.tracks[0].notes.length).toBeGreaterThan(0);
    });
    
    test('should handle invalid MIDI files', async () => {
      // Create an invalid "MIDI" file
      const invalidData = Buffer.from('this is not a MIDI file');
      
      await request(app)
        .post(`/api/sessions/${sessionId}/import/midi`)
        .attach('midiFile', invalidData, 'invalid.mid')
        .expect(400);
    });
  });
});