const request = require('supertest');
const { mockApp } = require('../testSetup');

describe('API Parameter Validation Tests', () => {
  let sessionId;

  beforeEach(async () => {
    // Create a test session for each test
    const sessionResponse = await request(mockApp)
      .post('/api/sessions')
      .send({
        name: 'Validation Test Session',
        tempo: 120,
        timeSignature: '4/4'
      });

    sessionId = sessionResponse.body.id;
  });

  describe('Note Parameter Validation', () => {
    it('should reject notes with invalid pitch values (below 0)', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: -1, // Invalid - MIDI pitch must be 0-127
          start: 0,
          duration: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject notes with invalid pitch values (above 127)', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 128, // Invalid - MIDI pitch must be 0-127
          start: 0,
          duration: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject notes with negative start time', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 60,
          start: -0.5, // Invalid - Start time cannot be negative
          duration: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject notes with negative or zero duration', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 60,
          start: 0,
          duration: 0 // Invalid - Duration must be positive
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');

      const negativeResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 60,
          start: 0,
          duration: -0.5 // Invalid - Duration must be positive
        });
      
      expect(negativeResponse.status).toBe(400);
      expect(negativeResponse.body).toHaveProperty('errors');
    });

    it('should reject notes with invalid velocity values (below 0)', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 60,
          start: 0,
          duration: 1,
          velocity: -10 // Invalid - Velocity must be 0-127
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject notes with invalid velocity values (above 127)', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/notes`)
        .send({
          pitch: 60,
          start: 0,
          duration: 1,
          velocity: 128 // Invalid - Velocity must be 0-127
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Session Parameter Validation', () => {
    it('should reject sessions with invalid tempo values (negative)', async () => {
      const response = await request(mockApp)
        .post('/api/sessions')
        .send({
          name: 'Invalid Tempo Session',
          tempo: -60, // Invalid - Tempo should be positive
          timeSignature: '4/4'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject sessions with invalid tempo values (unreasonably high)', async () => {
      const response = await request(mockApp)
        .post('/api/sessions')
        .send({
          name: 'Invalid Tempo Session',
          tempo: 1000, // Invalid - Tempo is unreasonably high
          timeSignature: '4/4'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject sessions with malformed time signatures', async () => {
      const response = await request(mockApp)
        .post('/api/sessions')
        .send({
          name: 'Invalid Signature Session',
          tempo: 120,
          timeSignature: '4/' // Invalid - Malformed time signature
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      const response2 = await request(mockApp)
        .post('/api/sessions')
        .send({
          name: 'Invalid Signature Session',
          tempo: 120,
          timeSignature: '4/0' // Invalid - Denominator cannot be 0
        });
      
      expect(response2.status).toBe(400);
      expect(response2.body).toHaveProperty('error');
    });
  });

  describe('Pattern Generation Parameter Validation', () => {
    it('should reject patterns with invalid key signatures', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'H', // Invalid - No such note as H in standard notation
          scaleType: 'major'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject patterns with invalid scale types', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          scaleType: 'invalid-scale' // Invalid - No such scale type
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject patterns with invalid octave values', async () => {
      const response = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          scaleType: 'major',
          octave: -1 // Invalid - Octave should be non-negative
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      const highResponse = await request(mockApp)
        .post(`/api/sessions/${sessionId}/patterns`)
        .send({
          type: 'chord',
          patternType: 'progression',
          key: 'C',
          scaleType: 'major',
          octave: 10 // Invalid - Octave too high for MIDI (notes would exceed 127)
        });
      
      expect(highResponse.status).toBe(400);
      expect(highResponse.body).toHaveProperty('error');
    });
  });
});
