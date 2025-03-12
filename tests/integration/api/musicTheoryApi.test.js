const request = require('supertest');
const app = require('../../../src/server/app');

describe('Music Theory API Integration Tests', () => {
  
  describe('GET /api/music-theory/scales/:root/:type', () => {
    test('should return a correctly formatted scale', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(7);
    });
    
    test('should handle scale requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C4/major')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes[0]).toBe(60); // C4 = MIDI note 60
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
      expect(response.body.notes).toEqual(['C', 'E', 'G']);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(3);
    });
    
    test('should return a correctly formatted seventh chord', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/C/seventh')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['C', 'E', 'G', 'Bb']);
      
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes.length).toBe(4);
    });
    
    test('should handle chord requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/G4/minor')
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      
      // Check that we have the right notes (either with flat or sharp notation)
      const expectedNoteExists = (note) => {
        return response.body.notes.includes(note);
      };
      
      expect(expectedNoteExists('G')).toBeTruthy();
      // Accept either Bb or A# notation
      expect(expectedNoteExists('Bb') || expectedNoteExists('A#')).toBeTruthy();
      expect(expectedNoteExists('D')).toBeTruthy();
      
      expect(response.body).toHaveProperty('midiNotes');
      // G4 = 67, Bb4 = 70, D5 = 74
      expect(response.body.midiNotes).toContain(67);
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
      expect(firstChord).toHaveProperty('roman');
      expect(firstChord).toHaveProperty('chord');
      expect(firstChord.chord).toHaveProperty('notes');
      expect(firstChord.chord).toHaveProperty('midiNotes');
    });
    
    test('should return minor chords in minor key progression', async () => {
      const response = await request(app)
        .get('/api/music-theory/progressions/A/minor')
        .expect(200);
      
      const iChord = response.body.chords.find(c => c.roman === 'i');
      expect(iChord).toBeTruthy();
      expect(iChord.chord.notes).toContain('A');
      expect(iChord.chord.notes).toContain('C');
      expect(iChord.chord.notes).toContain('E');
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
      
      expect(response.body).toHaveProperty('sharps');
      expect(response.body).toHaveProperty('flats');
      expect(response.body.sharps).toBe(0);
      expect(response.body.flats).toBe(0);
    });
    
    test('should return correct key signature for G major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/G/major')
        .expect(200);
      
      expect(response.body.sharps).toBe(1);
      expect(response.body.flats).toBe(0);
    });
    
    test('should return correct key signature for F major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/F/major')
        .expect(200);
      
      expect(response.body.sharps).toBe(0);
      expect(response.body.flats).toBe(1);
    });
    
    test('should return correct key signature for A minor', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/A/minor')
        .expect(200);
      
      expect(response.body.sharps).toBe(0);
      expect(response.body.flats).toBe(0);
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