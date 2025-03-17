// src/server/services/sessionService.js
/**
 * In-memory session service that mimics the original implementation
 */

const { v4: uuidv4 } = require('uuid');

// Store active sessions
const sessions = new Map();

class SessionService {
  constructor() {
    this.sessions = sessions;
  }

  /**
   * Create a new session
   * @param {Object} sessionData - Session properties
   * @returns {Object} The created session
   */
  createSession(sessionData = {}) {
    const sessionId = sessionData.id || `session_${Date.now()}`;
    
    if (this.sessions.has(sessionId)) {
      throw new Error(`Session with ID ${sessionId} already exists`);
    }
    
    const session = {
      id: sessionId,
      created: new Date(),
      name: sessionData.name || 'Untitled Session',
      bpm: sessionData.bpm || 120,
      timeSignature: sessionData.timeSignature || [4, 4],
      sequences: {},
      currentSequenceId: null,
      tracks: sessionData.tracks || []
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get all sessions
   * @returns {Array} Array of sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  /**
   * Get a session by ID
   * @param {string} sessionId - Session ID
   * @returns {Object} The session or null if not found
   */
  getSession(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    
    return session;
  }

  /**
   * Update a session
   * @param {string} sessionId - Session ID
   * @param {Object} updateData - Data to update
   * @returns {Object} The updated session
   */
  updateSession(sessionId, updateData) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    
    // Update properties
    Object.assign(session, updateData);
    this.sessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {boolean} True if deleted, false otherwise
   */
  deleteSession(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    return this.sessions.delete(sessionId);
  }

  /**
   * Create a sequence in a session
   * @param {string} sessionId - Session ID
   * @param {Object} sequenceData - Sequence properties
   * @returns {Object} The created sequence
   */
  createSequence(sessionId, sequenceData = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    
    const sequenceId = sequenceData.id || `seq_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
    const sequence = {
      id: sequenceId,
      name: sequenceData.name || 'Untitled Sequence',
      notes: sequenceData.notes || [],
      timeSignature: sequenceData.timeSignature || session.timeSignature,
      tempo: sequenceData.tempo || session.bpm,
      key: sequenceData.key || 'C major',
    };
    
    session.sequences[sequenceId] = sequence;
    session.currentSequenceId = sequenceId;
    
    return sequence;
  }

  /**
   * Get a sequence in a session
   * @param {string} sessionId - Session ID
   * @param {string} sequenceId - Sequence ID
   * @returns {Object} The sequence or null if not found
   */
  getSequence(sessionId, sequenceId) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    
    if (!session.sequences[sequenceId]) {
      return null;
    }
    
    return session.sequences[sequenceId];
  }

  /**
   * Add notes to the current sequence in a session
   * @param {string} sessionId - Session ID
   * @param {Array} notes - Array of note objects
   * @returns {Object} The current sequence
   */
  addNotes(sessionId, notes) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    
    if (!session.currentSequenceId || !session.sequences[session.currentSequenceId]) {
      throw new Error('No current sequence selected');
    }
    
    const currentSequence = session.sequences[session.currentSequenceId];
    currentSequence.notes = currentSequence.notes.concat(notes);
    
    return currentSequence;
  }
}

module.exports = new SessionService();
