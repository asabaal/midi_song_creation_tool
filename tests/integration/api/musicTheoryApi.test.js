// tests/integration/api/musicTheoryApi.test.js
const request = require('supertest');
const app = require('../../../src/server/app');

describe('Music Theory API Integration Tests', () => {
  describe('GET /api/music-theory/scales/:root/:type', () => {
    it('should return a correctly formatted scale', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/C/major')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes).toEqual([60, 62, 64, 65, 67, 69, 71]); // C4 major scale
    });

    it('should handle scale requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/scales/A/minor?octave=3')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
      expect(response.body).toHaveProperty('midiNotes');
      // A3 minor scale
      expect(response.body.midiNotes).toEqual([57, 59, 60, 62, 64, 65, 67]);
    });

    it('should return 400 for invalid scale type', async () => {
      await request(app)
        .get('/api/music-theory/scales/C/invalidScale')
        .expect(400);
    });

    it('should return 400 for invalid root note', async () => {
      await request(app)
        .get('/api/music-theory/scales/H/major')
        .expect(400);
    });
  });

  describe('GET /api/music-theory/chords/:root/:type', () => {
    it('should return a correctly formatted major chord', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/C/major')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['C', 'E', 'G']);
      expect(response.body).toHaveProperty('midiNotes');
      expect(response.body.midiNotes).toEqual([60, 64, 67]); // C4 major chord
    });

    it('should return a correctly formatted seventh chord', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/D/dominant7')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['D', 'F#', 'A', 'C']);
      expect(response.body).toHaveProperty('midiNotes');
      // D4 dominant 7th chord
      expect(response.body.midiNotes).toEqual([62, 66, 69, 72]);
    });

    it('should handle chord requests with different octaves', async () => {
      const response = await request(app)
        .get('/api/music-theory/chords/G/minor?octave=5')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['G', 'Bb', 'D']);
      expect(response.body).toHaveProperty('midiNotes');
      // G5 minor chord
      expect(response.body.midiNotes).toEqual([79, 82, 86]);
    });

    it('should return 400 for invalid chord type', async () => {
      await request(app)
        .get('/api/music-theory/chords/C/invalidChord')
        .expect(400);
    });
  });

  describe('GET /api/music-theory/progressions/:key/:mode', () => {
    it('should return a correctly formatted progression', async () => {
      const response = await request(app)
        .get('/api/music-theory/progressions/C/major?numerals=I-IV-V-I')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('chords');
      expect(response.body.chords).toHaveLength(4);
      
      // Check first chord (C major)
      expect(response.body.chords[0]).toHaveProperty('notes');
      expect(response.body.chords[0].notes).toEqual(['C', 'E', 'G']);
      
      // Check second chord (F major)
      expect(response.body.chords[1].notes).toEqual(['F', 'A', 'C']);
      
      // Check third chord (G major)
      expect(response.body.chords[2].notes).toEqual(['G', 'B', 'D']);
    });

    it('should return minor chords in minor key progression', async () => {
      const response = await request(app)
        .get('/api/music-theory/progressions/A/minor?numerals=i-iv-v-i')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('chords');
      expect(response.body.chords).toHaveLength(4);
      
      // Check first chord (A minor)
      expect(response.body.chords[0]).toHaveProperty('notes');
      expect(response.body.chords[0].notes).toEqual(['A', 'C', 'E']);
      
      // Check second chord (D minor)
      expect(response.body.chords[1].notes).toEqual(['D', 'F', 'A']);
    });

    it('should return 400 for invalid progression', async () => {
      await request(app)
        .get('/api/music-theory/progressions/C/major?numerals=I-VIII-III')
        .expect(400);
    });
  });

  describe('GET /api/music-theory/key-signature/:key/:mode', () => {
    it('should return correct key signature for C major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/C/major')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('keySignature');
      expect(response.body.keySignature).toBe(0); // C major has 0 sharps/flats
      expect(response.body).toHaveProperty('accidental');
      expect(response.body.accidental).toBe('sharp');
    });

    it('should return correct key signature for G major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/G/major')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('keySignature');
      expect(response.body.keySignature).toBe(1); // G major has 1 sharp
      expect(response.body).toHaveProperty('accidental');
      expect(response.body.accidental).toBe('sharp');
    });

    it('should return correct key signature for F major', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/F/major')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('keySignature');
      expect(response.body.keySignature).toBe(1); // F major has 1 flat
      expect(response.body).toHaveProperty('accidental');
      expect(response.body.accidental).toBe('flat');
    });

    it('should return correct key signature for A minor', async () => {
      const response = await request(app)
        .get('/api/music-theory/key-signature/A/minor')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('keySignature');
      expect(response.body.keySignature).toBe(0); // A minor has 0 sharps/flats (relative to C major)
      expect(response.body).toHaveProperty('accidental');
      expect(response.body.accidental).toBe('sharp');
    });

    it('should return 400 for invalid mode', async () => {
      await request(app)
        .get('/api/music-theory/key-signature/C/invalidMode')
        .expect(400);
    });
  });

  describe('POST /api/music-theory/analyze-chord', () => {
    it('should correctly identify a C major chord', async () => {
      const response = await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ midiNotes: [60, 64, 67] }) // C, E, G
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('root');
      expect(response.body.root).toBe('C');
      expect(response.body).toHaveProperty('type');
      expect(response.body.type).toBe('major');
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['C', 'E', 'G']);
    });

    it('should correctly identify a D minor 7th chord', async () => {
      const response = await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ midiNotes: [62, 65, 69, 72] }) // D, F, A, C
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('root');
      expect(response.body.root).toBe('D');
      expect(response.body).toHaveProperty('type');
      expect(response.body.type).toBe('minor7');
      expect(response.body).toHaveProperty('notes');
      expect(response.body.notes).toEqual(['D', 'F', 'A', 'C']);
    });

    it('should handle inversions and identify the chord', async () => {
      const response = await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ midiNotes: [64, 67, 72] }) // E, G, C (C major in 1st inversion)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('root');
      expect(response.body.root).toBe('C');
      expect(response.body).toHaveProperty('type');
      expect(response.body.type).toBe('major');
      expect(response.body).toHaveProperty('inversion');
      expect(response.body.inversion).toBe(1); // 1st inversion
    });

    it('should return 400 for invalid notes (less than 3)', async () => {
      await request(app)
        .post('/api/music-theory/analyze-chord')
        .send({ midiNotes: [60, 64] }) // Only 2 notes
        .expect(400);
    });
  });
});
