// tests/fixtures/mock-data/db-setup.js
const { v4: uuidv4 } = require('uuid');

// In-memory mock database
const mockDb = {
  sessions: [],
  _id: 0,
  
  // Generate MongoDB-like ObjectId
  createObjectId() {
    this._id += 1;
    return this._id.toString();
  }
};

// Constructor for Session documents
function SessionDocument(data) {
  // Copy all properties from data
  Object.assign(this, data);
  
  // Ensure _id exists
  if (!this._id) {
    this._id = mockDb.createObjectId();
  }
  
  // Add save method to the instance
  this.save = async function() {
    const sessionIndex = mockDb.sessions.findIndex(s => s._id === this._id);
    
    if (sessionIndex >= 0) {
      // Update existing session
      mockDb.sessions[sessionIndex] = { ...this };
    } else {
      // Create new session
      mockDb.sessions.push(this);
    }
    
    return this;
  };
  
  // Convert _id to string
  this.toJSON = function() {
    const result = { ...this };
    // Convert _id to 'id' for API compatibility
    result.id = this._id;
    return result;
  };
}

// Mock Session model
const Session = function(data) {
  return new SessionDocument(data);
};

// Static methods for Session model
Session.insertMany = async (sessions) => {
  const results = [];
  for (const sessionData of sessions) {
    const session = new SessionDocument(sessionData);
    await session.save();
    results.push(session);
  }
  return results;
};

Session.find = async (query = {}) => {
  let results = [...mockDb.sessions];
  
  // Handle date filtering
  if (query.createdAt && query.createdAt.$gte) {
    const fromDate = new Date(query.createdAt.$gte);
    results = results.filter(session => 
      new Date(session.createdAt) >= fromDate
    );
  }
  
  // Convert all results to SessionDocument instances
  return results.map(r => new SessionDocument(r));
};

Session.findById = async (id) => {
  const session = mockDb.sessions.find(s => s._id === id);
  return session ? new SessionDocument(session) : null;
};

Session.findByIdAndDelete = async (id) => {
  const sessionIndex = mockDb.sessions.findIndex(s => s._id === id);
  if (sessionIndex >= 0) {
    const deletedSession = mockDb.sessions[sessionIndex];
    mockDb.sessions.splice(sessionIndex, 1);
    return new SessionDocument(deletedSession);
  }
  return null;
};

/**
 * Set up the mock database for testing
 */
async function setupTestDb() {
  // Clear any existing data
  mockDb.sessions = [];
  mockDb._id = 0;
  
  // Seed with test data
  await seedTestData();
}

/**
 * Clean up the mock database
 */
async function teardownTestDb() {
  // Clear all data
  mockDb.sessions = [];
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
  return session._id;
}

module.exports = {
  setupTestDb,
  teardownTestDb,
  createTestSession,
  Session
};