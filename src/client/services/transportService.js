/**
 * Transport Service - handles playback, timing, and transport controls
 */

// Internal state
let playing = false;
let currentTick = 0;
let bpm = 120;
let loop = { enabled: false, start: 0, end: 16 * 480 }; // 16 beats by default
let tickListeners = [];
let timerHandle = null;
let ppq = 480; // Pulses Per Quarter note

/**
 * Start playback
 */
export function play() {
  if (playing) return;
  
  playing = true;
  startTimer();
}

/**
 * Pause playback
 */
export function pause() {
  playing = false;
  stopTimer();
}

/**
 * Stop playback and reset position
 */
export function stop() {
  playing = false;
  stopTimer();
  setPosition(0);
}

/**
 * Check if transport is playing
 * @returns {boolean} True if playing
 */
export function isPlaying() {
  return playing;
}

/**
 * Set the tempo in beats per minute
 * @param {number} newBpm - Tempo in BPM
 */
export function setBpm(newBpm) {
  bpm = Math.max(40, Math.min(240, newBpm));
  
  // Update timing if playing
  if (playing) {
    stopTimer();
    startTimer();
  }
}

/**
 * Set the loop parameters
 * @param {Object} loopParams - Loop parameters
 * @param {boolean} loopParams.enabled - Whether loop is enabled
 * @param {number} loopParams.start - Loop start position in ticks
 * @param {number} loopParams.end - Loop end position in ticks
 */
export function setLoop(loopParams) {
  loop = {
    ...loop,
    ...loopParams
  };
}

/**
 * Get the current position in ticks
 * @returns {number} Current position in ticks
 */
export function getCurrentTick() {
  return currentTick;
}

/**
 * Set the current position
 * @param {number} tick - Position in ticks
 */
export function setPosition(tick) {
  currentTick = Math.max(0, tick);
  notifyTickListeners();
}

/**
 * Subscribe to tick updates
 * @param {Function} callback - Function to call with current tick position
 */
export function subscribeToTick(callback) {
  if (typeof callback === 'function' && !tickListeners.includes(callback)) {
    tickListeners.push(callback);
  }
}

/**
 * Unsubscribe from tick updates
 * @param {Function} callback - Function to remove from listeners
 */
export function unsubscribeFromTick(callback) {
  tickListeners = tickListeners.filter(listener => listener !== callback);
}

/**
 * Start the timer for playback
 * @private
 */
function startTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
  }
  
  // Calculate tick interval (in milliseconds)
  // 60000 ms per minute / BPM = ms per beat
  // ms per beat / ppq = ms per tick
  const tickInterval = Math.floor(60000 / bpm / ppq);
  
  timerHandle = setInterval(() => {
    advanceTick();
  }, tickInterval);
}

/**
 * Stop the playback timer
 * @private
 */
function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

/**
 * Advance the current tick position
 * @private
 */
function advanceTick() {
  currentTick++;
  
  // Handle looping
  if (loop.enabled && currentTick >= loop.end) {
    currentTick = loop.start;
  }
  
  notifyTickListeners();
}

/**
 * Notify all tick listeners with the current position
 * @private
 */
function notifyTickListeners() {
  tickListeners.forEach(listener => {
    try {
      listener(currentTick);
    } catch (e) {
      console.error('Error in tick listener:', e);
    }
  });
}
