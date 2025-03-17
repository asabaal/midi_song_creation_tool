// src/server/models/session.js
const { v4: uuidv4 } = require('uuid');

// In-memory Session implementation similar to the original code
class Session {
  constructor(options = {}) {
    this._id = options._id || uuidv4();
    this.id = this._id; // For backward compatibility
    this.name = options.name || 'Untitled Session';
    this.bpm = options.bpm || 120;
    this.timeSignature = options.timeSignature || [4, 4];
    this.tracks = options.tracks || [];
    this.createdAt = options.createdAt || new Date();
  }

  // Mock save method to make API compatible
  async save() {
    // Update the session in the in-memory store
    sessions.set(this._id, this);
    return this;
  }

  // Static methods for finding/querying
  static async findById(id) {
    return sessions.get(id) || null;
  }

  static async find(query = {}) {
    return Array.from(sessions.values());
  }

  static async findByIdAndDelete(id) {
    const session = sessions.get(id);
    if (session) {
      sessions.delete(id);
    }
    return session;
  }
}

// In-memory store for sessions
const sessions = new Map();

module.exports = { Session, sessions };
