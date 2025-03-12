// src/client/services/transportService.js

let isPlayingState = false;
let currentTick = 0;
let bpm = 120;
let tickListeners = [];
let tickIntervalId = null;

/**
 * Play the transport
 */
export const play = () => {
  isPlayingState = true;
  
  // Start tick interval
  if (!tickIntervalId) {
    const tickInterval = 10; // ms between ticks
    tickIntervalId = setInterval(() => {
      currentTick += 1;
      notifyListeners();
    }, tickInterval);
  }
};

/**
 * Pause the transport
 */
export const pause = () => {
  isPlayingState = false;
  
  // Stop tick interval
  if (tickIntervalId) {
    clearInterval(tickIntervalId);
    tickIntervalId = null;
  }
};

/**
 * Stop the transport (pause and reset position)
 */
export const stop = () => {
  pause();
  currentTick = 0;
  notifyListeners();
};

/**
 * Set the BPM (tempo)
 * @param {number} newBpm - New BPM value
 */
export const setBpm = (newBpm) => {
  bpm = newBpm;
};

/**
 * Check if transport is currently playing
 * @returns {boolean} True if playing
 */
export const isPlaying = () => {
  return isPlayingState;
};

/**
 * Get current tick position
 * @returns {number} Current tick
 */
export const getCurrentTick = () => {
  return currentTick;
};

/**
 * Subscribe to tick updates
 * @param {Function} listener - Function to call on tick update
 */
export const subscribeToTick = (listener) => {
  tickListeners.push(listener);
};

/**
 * Unsubscribe from tick updates
 * @param {Function} listener - Function to remove
 */
export const unsubscribeFromTick = (listener) => {
  tickListeners = tickListeners.filter(l => l !== listener);
};

/**
 * Notify all listeners of current tick
 */
const notifyListeners = () => {
  tickListeners.forEach(listener => {
    listener(currentTick);
  });
};
