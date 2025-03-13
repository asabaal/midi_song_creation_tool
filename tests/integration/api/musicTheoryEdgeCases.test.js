const request = require('supertest');
const { mockApp } = require('../testSetup');

describe('Music Theory Edge Cases Tests', () => {
  describe('Non-Standard Scales', () => {
    it('should handle pentatonic scales', async () => {
      const response = await request(mockApp)
        .get('/api/music-theory/scales/C/pentatonic')
        .expect(200);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      // Pentatonic scales should have 5 notes
      expect(response.body.notes.length).toBe(5);
    });

    it('should handle blues scales', async () => {
      const response = await request(mockApp)
        .get('/api/music-theory/scales/G/blues')
        .expect(200);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      // Blues scales should have 6 notes
      expect(response.body.notes.length).toBe(6);
    });

    it('should handle modes', async () => {
      const modes = ['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'];
      
      for (const mode of modes) {
        const response = await request(mockApp)
          .get(`/api/music-theory/scales/D/${mode}`)
          .expect(200);

        expect(response.body).toHaveProperty('notes');
        expect(Array.isArray(response.body.notes)).toBe(true);
        // All modes should have 7 notes
        expect(response.body.notes.length).toBe(7);
      }
    });
  });

  describe('Chord Inversions and Extensions', () => {
    it('should handle chord inversions', async () => {
      // Test for C major 1st inversion
      const response = await request(mockApp)
        .post('/api/music-theory/analyze-chord')
        .send({
          notes: [64, 67, 72] // E-G-C (C major 1st inversion)
        })
        .expect(200);

      expect(response.body).toHaveProperty('root', 'C');
      expect(response.body).toHaveProperty('type', 'major');
      expect(response.body).toHaveProperty('inversion', 1);
    });

    it('should handle extended chords', async () => {
      // Test dominant 7th
      const response = await request(mockApp)
        .get('/api/music-theory/chords/G/seventh')
        .expect(200);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
      expect(response.body.notes.length).toBe(4); // Should have 4 notes
    });

    it('should handle diminished and augmented chords', async () => {
      // Test diminished
      const dimResponse = await request(mockApp)
        .get('/api/music-theory/chords/B/diminished')
        .expect(200);

      expect(dimResponse.body).toHaveProperty('notes');
      
      // Test augmented
      const augResponse = await request(mockApp)
        .get('/api/music-theory/chords/C/augmented')
        .expect(200);

      expect(augResponse.body).toHaveProperty('notes');
    });
  });

  describe('Unusual Key Signatures and Accidentals', () => {
    it('should handle keys with sharps', async () => {
      const response = await request(mockApp)
        .get('/api/music-theory/scales/F#/major')
        .expect(200);

      expect(response.body).toHaveProperty('notes');
    });

    it('should handle keys with flats', async () => {
      const response = await request(mockApp)
        .get('/api/music-theory/scales/Bb/minor')
        .expect(200);

      expect(response.body).toHaveProperty('notes');
    });

    it('should handle enharmonic equivalents correctly', async () => {
      // C# and Db are enharmonic equivalents
      const sharpResponse = await request(mockApp)
        .get('/api/music-theory/scales/C#/major');
      
      const flatResponse = await request(mockApp)
        .get('/api/music-theory/scales/Db/major');

      // Both should return valid scales
      expect(sharpResponse.status).toBe(200);
      expect(flatResponse.status).toBe(200);

      // The notes may be spelled differently but should represent the same scale
      expect(sharpResponse.body.notes.length).toBe(flatResponse.body.notes.length);
    });
  });

  describe('Octave Transposition', () => {
    it('should handle transposition across octaves', async () => {
      // Get C major scale in octave 4
      const octave4Response = await request(mockApp)
        .get('/api/music-theory/scales/C4/major')
        .expect(200);

      // Get C major scale in octave 5
      const octave5Response = await request(mockApp)
        .get('/api/music-theory/scales/C5/major')
        .expect(200);

      expect(octave4Response.body).toHaveProperty('midiNotes');
      expect(octave5Response.body).toHaveProperty('midiNotes');

      // MIDI notes in octave 5 should be 12 semitones higher than octave 4
      if (octave4Response.body.midiNotes.length > 0 && octave5Response.body.midiNotes.length > 0) {
        expect(octave5Response.body.midiNotes[0] - octave4Response.body.midiNotes[0]).toBe(12);
      }
    });

    it('should validate MIDI note boundaries', async () => {
      // Test very low octave (should be valid)
      const lowResponse = await request(mockApp)
        .get('/api/music-theory/scales/C0/major')
        .expect(200);

      // Test very high octave (should be valid but below 128)
      const highResponse = await request(mockApp)
        .get('/api/music-theory/scales/C8/major')
        .expect(200);

      // Both should have MIDI notes
      expect(lowResponse.body).toHaveProperty('midiNotes');
      expect(highResponse.body).toHaveProperty('midiNotes');

      // All MIDI notes should be within 0-127 range
      const allMidiNotes = [...lowResponse.body.midiNotes, ...highResponse.body.midiNotes];
      const validMidiRange = allMidiNotes.every(note => note >= 0 && note <= 127);
      expect(validMidiRange).toBe(true);
    });
  });

  describe('Time Signatures and Quantization', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a test session for each test
      const sessionResponse = await request(mockApp)
        .post('/api/sessions')
        .send({
          name: 'Time Signature Test Session',
          tempo: 120,
          timeSignature: '4/4'
        });

      sessionId = sessionResponse.body.id;
    });

    it('should handle different time signatures', async () => {
      // Test common time signatures
      const timeSignatures = ['3/4', '6/8', '5/4', '7/8'];
      
      for (const timeSignature of timeSignatures) {
        // Update the session time signature
        await request(mockApp)
          .put(`/api/sessions/${sessionId}`)
          .send({ timeSignature })
          .expect(200);

        // Verify the update was successful
        const sessionResponse = await request(mockApp)
          .get(`/api/sessions/${sessionId}`)
          .expect(200);

        expect(sessionResponse.body.timeSignature).toBe(timeSignature);
      }
    });

    it('should handle quantization with different time signatures', async () => {
      // Update to 3/4 time
      await request(mockApp)
        .put(`/api/sessions/${sessionId}`)
        .send({ timeSignature: '3/4' })
        .expect(200);

      // Generate a pattern (quantization would depend on time signature)
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          scaleType: 'major'
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes');
      expect(Array.isArray(response.body.notes)).toBe(true);
    });
  });
});
