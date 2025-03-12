// tests/integration/api/musicTheoryApi.test.js
const request = require('supertest');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../utils/testDB');
const apiMockSetup = require('./apiMockSetup');

// Use the mock API directly
const app = apiMockSetup();

describe('Music Theory API Integration Tests', () => {
  // Setup and teardown for the test database
  beforeAll(async () => {
    await setupTestDB();
  });
  
  afterAll(async () => {
    await teardownTestDB();
  });
  
  describe('GET /api/music-theory/scales/:root/:type', () => {
    test('should return a correctly formatted scale', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBeGreaterThan(0);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(response.body.notes.length);
    });
    
    test('should handle scale requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C4/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBeGreaterThan(0);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(response.body.notes.length);
    });
    
    test('should return 400 for invalid scale type', async () => {
      await request(app)
        .get('/api/music-theory/scales/C/invalidType')
        .expect(400);
    });
    
    test('should return 400 for invalid root note', async () => {
      await request(app)
        .get('/api/music-theory/scales/H/major')
        .expect(400);
    });
  });
  
  describe('GET /api/music-theory/chords/:root/:type', () => {
    test('should return a correctly formatted major chord', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/C/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBe(3);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(3);
    });
    
    test('should return a correctly formatted seventh chord', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/C/seventh')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes.length).toBe(4);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(4);
    });
    
    test('should handle chord requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/G4/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      
      // One of the notes should include a 'G'
      expect(response.body.notes.some(note => note.includes('G'))).toBeTruthy();
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(response.body.notes.length);
    });
    
    test('should return 400 for invalid chord type', async () => {
      await request(app)
        .get('/api/music-theory/chords/C/invalidType')
        .expect(400);
    });
  });
  
  describe('GET /api/music-theory/progressions/:key/:mode', () => {
    test('should return a correctly formatted progression', async () => {
      const response = await request(app)
        .get('/api/music-theory/progressions/C/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('chords');
      expect(response.body.chords.length).toBeGreaterThan(0);
      
      const firstChord = response.body.chords[0];
      expect(firstChord).toHaveProperty('numeral');
      expect(firstChord).toHaveProperty('notes');
      expect(firstChord).toHaveProperty('midiNotes');
    });
    
    test('should return minor chords in minor key progression', async () => {
      const response = await request(app)
        .get('/api/music-theory/progressions/A/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('chords');
      expect(response.body.chords.length).toBeGreaterThan(0);
    });
    
    test('should return 400 for invalid progression', async () => {
      await request(app)
        .get('/api/music-theory/progressions/C/invalidMode')
        .expect(400);
    });
  });
  
  describe('GET /api/music-theory/key-signature/:key/:mode', () => {
    test('should return correct key signature for C major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/C/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('keySignature');
      expect(response.body).toHaveProperty('accidental');
    });
    
    test('should return correct key signature for G major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/G/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('sharps');
      expect(response.body.sharps).toBe(1);
    });
    
    test('should return correct key signature for F major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/F/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('flats');
      expect(response.body.flats).toBe(1);
    });
    
    test('should return correct key signature for A minor', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/A/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('keySignature');
    });
    
    test('should return 400 for invalid mode', async () => {
      await request(app)
        .get('/api/music-theory/key-signature/C/invalidMode')
        .expect(400);
    });
  });
  
  describe('POST /api/music-theory/analyze-chord', () => {
    test('should correctly identify a C major chord', async () => {
      const response = await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ notes: [60, 64, 67] }) // C, E, G
        .expect(200);
      
      expect(response.body).toHaveProperty('root');
      expect(response.body).toHaveProperty('type');
      expect(response.body.root).toBe('C');
      expect(response.body.type).toBe('major');
    });
    
    test('should correctly identify a D minor 7th chord', async () => {
      const response = await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ notes: [62, 65, 69, 72] }) // D, F, A, C
        .expect(200);
      
      expect(response.body.root).toBe('D');
      expect(response.body.type).toBe('minor7');
    });
    
    test('should handle inversions and identify the chord', async () => {
      const response = await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ notes: [64, 67, 72] }) // E, G, C (C major, 1st inversion)
        .expect(200);
      
      expect(response.body.root).toBe('C');
      expect(response.body.type).toBe('major');
      expect(response.body).toHaveProperty('inversion');
      expect(response.body.inversion).toBe(1);
    });
    
    test('should return 400 for invalid notes (less than 3)', async () => {
      await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ notes: [60, 64] }) // Only 2 notes
        .expect(400);
    });
  });
});