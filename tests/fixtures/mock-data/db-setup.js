// tests/fixtures/mock-data/db-setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { Session } = require('../../../src/server/models/session');
const { v4: uuidv4 } = require('uuid');

let mongoServer;

/**
 * Set up an in-memory MongoDB server for testing
 */
async function setupTestDb() {
  // Create a new instance of MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect Mongoose to the Memory Server
  await mongoose.connect(uri);
  
  // Clear all collections
  await mongoose.connection.db.dropDatabase();
  
  // Seed with some test data
  await seedTestData();
}

/**
 * Clean up and close the test database
 */
async function teardownTestDb() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

/**
 * Seed database with test data
 */
async function seedTestData() {
  // Create a few test sessions
  const testSessions = [
    {
      name: 'Test Session 1',
      bpm: 120,
      timeSignature: [4, 4],
      tracks: [
        {
          id: 0,
          name: 'Piano',
          instrument: 0,
          notes: [
            { 
              id: uuidv4(),
              pitch: 60, 
              startTime: 0, 
              duration: 1, 
              velocity: 100 
            },
            { 
              id: uuidv4(),
              pitch: 64, 
              startTime: 1, 
              duration: 1, 
              velocity: 100 
            }
          ]
        }
      ],
      createdAt: new Date()
    },
    {
      name: 'Test Session 2',
      bpm: 100,
      timeSignature: [3, 4],
      tracks: [],
      createdAt: new Date()
    }
  ];
  
  // Insert test sessions
  await Session.insertMany(testSessions);
}

/**
 * Create a test session with a given name
 * @param {string} name 
 * @returns {Promise<string>} Session ID
 */
async function createTestSession(name) {
  const session = new Session({
    name: name || `Test Session ${Date.now()}`,
    bpm: 120,
    timeSignature: [4, 4],
    tracks: []
  });
  
  await session.save();
  return session._id.toString();
}

module.exports = {
  setupTestDb,
  teardownTestDb,
  createTestSession
};