const request = require('supertest');
const { mockApp } = require('../testSetup');

describe('Data Consistency Tests', () => {
  let sessionId;
  let trackId;

  beforeEach(async () => {
    // Create a test session for each test
    const sessionResponse = await request(mockApp)
      .post('/api/sessions')
      .send({
        name: 'Data Consistency Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    sessionId = sessionResponse.body.id;
    
    // Create a track
    const trackResponse = await request(mockApp)
      .post(`/api/sessions/${sessionId}/tracks`)
      .send({
        name: 'Test Track',
        instrument: 'piano'
      });
    
    trackId = trackResponse.body.id;
  });

  describe('Track-Note Relationships', () => {
    it('should maintain track/note relationships after operations', async () => {
      // Add notes to the track
      const noteIds = [];
      for (let i = 0; i < 3; i++) {
        const noteResponse = await request(mockApp)
          .post(`/api/sessions/${sessionId}/notes`)
          .send({
            pitch: 60 + i,
            start: i * 0.5,
            duration: 0.5,
            velocity: 100,
            trackId: trackId
          });
        
        expect(noteResponse.status).toBe(201);
        noteIds.push(noteResponse.body.id);
      }
      
      // Get the session and verify track contains the notes
      const sessionResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}`);
      
      expect(sessionResponse.status).toBe(200);
      
      // Find our track in the response
      const track = sessionResponse.body.tracks.find(t => t.id === trackId);
      expect(track).toBeDefined();
      
      // Verify notes are associated with the track
      // Note: Depending on the API implementation, this might need adjusting
      expect(track.notes).toBeDefined();
      expect(track.notes.length).toBe(3);
      
      // Verify each note exists in the track
      for (const noteId of noteIds) {
        const noteExists = track.notes.some(note => note.id === noteId);
        expect(noteExists).toBe(true);
      }
    });

    it('should maintain data integrity when tracks are deleted', async () => {
      // Add notes to the track
      for (let i = 0; i < 3; i++) {
        await request(mockApp)
          .post(`/api/sessions/${sessionId}/notes`)
          .send({
            pitch: 60 + i,
            start: i * 0.5,
            duration: 0.5,
            velocity: 100,
            trackId: trackId
          })
          .expect(201);
      }
      
      // Delete the track
      await request(mockApp)
        .delete(`/api/sessions/${sessionId}/tracks/${trackId}`)
        .expect(204);
      
      // Verify the session still exists and is consistent
      const sessionResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}`);
      
      expect(sessionResponse.status).toBe(200);
      
      // Verify track no longer exists
      const trackExists = sessionResponse.body.tracks.some(t => t.id === trackId);
      expect(trackExists).toBe(false);
      
      // Verify associated notes were also deleted (or at least aren't accessible)
      // Note: This test assumes notes are deleted when their track is deleted
      const notesResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}/notes?trackId=${trackId}`);
      
      if (notesResponse.status === 200) {
        // If endpoint returns 200, there should be no notes for this track
        expect(notesResponse.body.length).toBe(0);
      } else {
        // Or it might return 404 if trackId doesn't exist
        expect(notesResponse.status).toBe(404);
      }
    });
  });

  describe('Session-Level Data Consistency', () => {
    it('should maintain consistent tempo across the session', async () => {
      // Update session tempo
      await request(mockApp)
        .put(`/api/sessions/${sessionId}`)
        .send({
          tempo: 140
        })
        .expect(200);
      
      // Create a pattern
      const patternResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          scaleType: 'major'
        });
      
      expect(patternResponse.status).toBe(201);
      
      // Get the session and verify tempo is consistent
      const sessionResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}`);
      
      expect(sessionResponse.status).toBe(200);
      expect(sessionResponse.body.tempo).toBe(140);
      
      // Verify transport settings also reflect the updated tempo
      const transportResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}/transport`);
      
      if (transportResponse.status === 200) {
        expect(transportResponse.body.bpm).toBe(140);
      }
    });

    it('should ensure all MIDI export is consistent with session state', async () => {
      // Add some notes
      for (let i = 0; i < 3; i++) {
        await request(mockApp)
          .post(`/api/sessions/${sessionId}/notes`)
          .send({
            pitch: 60 + i,
            start: i * 0.5,
            duration: 0.5,
            velocity: 100,
            trackId: trackId
          })
          .expect(201);
      }
      
      // Get MIDI export
      const midiResponse = await request(mockApp)
        .get(`/api/sessions/${sessionId}/export/midi`)
        .expect(200)
        .expect('Content-Type', /octet-stream/)
        .expect('Content-Disposition', /attachment/);
      
      // Verify MIDI data exists
      expect(midiResponse.body).toBeTruthy();
      
      // Get JSON export to compare
      const jsonResponse = await request(mockApp)
        .get(`/api/export/json/${sessionId}`)
        .expect(200)
        .expect('Content-Type', /json/);
      
      // Verify JSON data is consistent
      expect(jsonResponse.body).toHaveProperty('id', sessionId);
      expect(jsonResponse.body).toHaveProperty('tempo', 120);
      expect(jsonResponse.body).toHaveProperty('tracks');
      expect(jsonResponse.body.tracks.length).toBeGreaterThan(0);
      
      // Verify track exists in JSON export
      const trackInJson = jsonResponse.body.tracks.find(t => t.id === trackId);
      expect(trackInJson).toBeDefined();
      
      // Verify notes exist in the JSON export
      expect(trackInJson.notes).toBeDefined();
      expect(trackInJson.notes.length).toBe(3);
    });
  });

  describe('Pattern Generation Consistency', () => {
    it('should ensure patterns follow musical rules', async () => {
      // Generate a chord pattern
      const chordResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          scaleType: 'major',
          progressionName: '1-4-5'
        });
      
      expect(chordResponse.status).toBe(201);
      expect(chordResponse.body).toHaveProperty('notes');
      expect(Array.isArray(chordResponse.body.notes)).toBe(true);
      expect(chordResponse.body.notes.length).toBeGreaterThan(0);
      
      // Analyze created notes to verify they form valid chords
      // (Basic check - assuming C major 1-4-5 would produce C, F and G chords)
      const pitchClasses = chordResponse.body.notes.map(note => note.pitch % 12);
      
      // Check for C notes (pitch class 0)
      expect(pitchClasses).toContain(0);
      
      // Check for E notes (pitch class 4) or F notes (pitch class 5)
      expect(pitchClasses.some(pc => pc === 4 || pc === 5)).toBe(true);
      
      // Check for G notes (pitch class 7)
      expect(pitchClasses).toContain(7);
    });

    it('should generate consistent patterns for the same input parameters', async () => {
      // Generate a pattern with specific parameters
      const pattern1Response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'bassline',
          patternType: 'walking',
          key: 'C',
          scaleType: 'major',
          bars: 1
        });
      
      expect(pattern1Response.status).toBe(201);
      
      // Generate another pattern with the same parameters
      const pattern2Response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'bassline',
          patternType: 'walking',
          key: 'C',
          scaleType: 'major',
          bars: 1
        });
      
      expect(pattern2Response.status).toBe(201);
      
      // Note count should be the same for both patterns
      expect(pattern1Response.body.notes.length).toBe(pattern2Response.body.notes.length);
      
      // Pattern should be deterministic - not testing exact equality because
      // the mock might generate random IDs, but the pitches should match
      const pitches1 = pattern1Response.body.notes.map(note => note.pitch);
      const pitches2 = pattern2Response.body.notes.map(note => note.pitch);
      
      expect(pitches1).toEqual(pitches2);
    });
  });
});
