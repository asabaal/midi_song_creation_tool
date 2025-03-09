// src/server/models/session.js
const { v4: uuidv4 } = require('uuid');

// In testing mode, use the mock database
if (process.env.NODE_ENV === 'test') {
  // Get the mock Session model from the test setup
  const { Session } = require('../../../tests/fixtures/mock-data/db-setup');
  module.exports = { Session };
} else {
  // Use real Mongoose in production
  const mongoose = require('mongoose');

  // Note schema (embedded in Track)
  const NoteSchema = new mongoose.Schema({
    id: { type: String, default: () => uuidv4() },
    pitch: { type: Number, required: true },
    startTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    velocity: { type: Number, default: 100 },
  });

  // Track schema (embedded in Session)
  const TrackSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, default: 'Untitled Track' },
    instrument: { type: Number, default: 0 },
    notes: [NoteSchema],
  });

  // Session schema
  const SessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bpm: { type: Number, required: true, default: 120 },
    timeSignature: { type: [Number], required: true, default: [4, 4] },
    tracks: [TrackSchema],
    loop: {
      enabled: { type: Boolean, default: false },
      start: { type: Number, default: 0 },
      end: { type: Number, default: 8 },
    },
    createdAt: { type: Date, default: Date.now },
  });

  // Create models
  const Session = mongoose.model('Session', SessionSchema);

  module.exports = { Session };
}
