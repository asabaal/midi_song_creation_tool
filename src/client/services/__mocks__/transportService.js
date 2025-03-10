// src/client/services/__mocks__/transportService.js
export const play = jest.fn();
export const pause = jest.fn();
export const stop = jest.fn();
export const setBpm = jest.fn();
export const isPlaying = jest.fn().mockReturnValue(false);
export const getCurrentTick = jest.fn().mockReturnValue(0);
export const subscribeToTick = jest.fn();
export const unsubscribeFromTick = jest.fn();
export const setTimeSignature = jest.fn();
export const setLoopPoints = jest.fn();
export const setLoopEnabled = jest.fn();

export default {
  play,
  pause,
  stop,
  setBpm,
  isPlaying,
  getCurrentTick,
  subscribeToTick,
  unsubscribeFromTick,
  setTimeSignature,
  setLoopPoints,
  setLoopEnabled
};
