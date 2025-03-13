const request = require('supertest');
const { app } = require('../testSetup');

describe('Music Theory API Integration Tests', () => {
  describe('GET /api/music-theory/scales/:root/:type', () => {
    it('should return correct scale notes', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      expect(response.body.notes.length).toBeGreaterThan(0);
      
      // Check for MIDI notes
      expect(response.body).toHaveProperty('midiNotes');
      expect(Array.isArray(response.body.midiNotes)).toBe(true);
      expect(response.body.midiNotes.length).toBe(response.body.notes.length);
    });
    
    it('should handle different scale types', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/D/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      expect(response.body.notes.length).toBeGreaterThan(0);
    });
    
    it('should handle scale requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C4/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBeGreaterThan(0);
    });
    
    it('should return 400 for invalid scale type', async () => {
      await request(app)
        .get('/api/music-theory/scales/C/invalidScale')
        .expect(400);
    });
    
    it('should return 400 for invalid note', async () => {
      await request(app)
        .get('/api/music-theory/scales/H/major')
        .expect(400);
    });
  });
  
  describe('GET /api/music-theory/chords/:root/:type', () => {
    it('should return correct chord notes', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/G/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      
      // Check for MIDI notes
      expect(response.body).toHaveProperty('midiNotes');
      expect(Array.isArray(response.body.midiNotes)).toBe(true);
      expect(response.body.midiNotes.length).toBe(response.body.notes.length);
    });
    
    it('should handle different chord types', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/A/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
    });
    
    it('should handle chord requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/G4/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
    });
    
    it('should return 400 for invalid chord type', async () => {
      await request(app)
        .get('/api/music-theory/chords/C/invalidChord')
        .expect(400);
    });
    
    it('should return 400 for invalid note', async () => {
      await request(app)
        .get('/api/music-theory/chords/H/major')
        .expect(400);
    });
  });
});
