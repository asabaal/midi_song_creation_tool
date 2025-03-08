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
  },
  
  // Find a session by ID
  findSessionById(id) {
    return this.sessions.find(session => session._id.toString() === id);
  },
  
  // Clone an object to simulate MongoDB document return
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};

// Mock Session model
const Session = {
  insertMany: async (sessions) => {
    sessions.forEach(session => {
      const newSession = { ...session, _id: mockDb.createObjectId() };
      mockDb.sessions.push(newSession);
    });
    return mockDb.clone(sessions);
  },
  
  find: async (query = {}) => {
    let results = mockDb.sessions;
    
    // Handle date filtering
    if (query.createdAt && query.createdAt.$gte) {
      const fromDate = new Date(query.createdAt.$gte);
      results = results.filter(session => 
        new Date(session.createdAt) >= fromDate
      );
    }
    
    return mockDb.clone(results);
  },
  
  findById: async (id) => {
    const session = mockDb.findSessionById(id);
    return session ? mockDb.clone(session) : null;
  },
  
  findByIdAndDelete: async (id) => {
    const sessionIndex = mockDb.sessions.findIndex(s => s._id.toString() === id);
    if (sessionIndex >= 0) {
      const deletedSession = mockDb.sessions[sessionIndex];
      mockDb.sessions.splice(sessionIndex, 1);
      return mockDb.clone(deletedSession);
    }
    return null;
  }
};

// Prototype for the Session class
Session.prototype = {
  save: async function() {
    const sessionIndex = mockDb.sessions.findIndex(s => s._id.toString() === this._id.toString());
    
    if (sessionIndex >= 0) {
      // Update existing session
      mockDb.sessions[sessionIndex] = { ...this };
    } else {
      // Create new session
      this._id = mockDb.createObjectId();
      mockDb.sessions.push(this);
    }
    
    return this;
  }
};

/**
 * Set up the mock database for testing
 */
async function setupTestDb() {
  // Clear any existing data
  mockDb.sessions = [];
  
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
  const session = {
    name: name || `Test Session ${Date.now()}`,
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [],
    save: Session.prototype.save
  };
  
  await session.save();
  return session._id.toString();
}

module.exports = {
  setupTestDb,
  teardownTestDb,
  createTestSession,
  Session
};