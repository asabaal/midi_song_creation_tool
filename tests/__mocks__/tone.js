// tests/__mocks__/tone.js
const Tone = {
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    bpm: {
      value: 120,
      set: jest.fn(),
    },
    timeSignature: 4,
    position: '0:0:0',
    setLoopPoints: jest.fn(),
    loop: false,
    seconds: 0,
    schedule: jest.fn(),
    scheduleRepeat: jest.fn(),
    cancel: jest.fn(),
    PPQ: 192,
  },
  start: jest.fn(),
  Master: {
    volume: {
      value: 0,
    },
  },
  Synth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  PolySynth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  Sampler: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  MembraneSynth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  NoiseSynth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  Buffer: {
    loaded: jest.fn().mockReturnValue(Promise.resolve()),
  },
  loaded: jest.fn().mockReturnValue(Promise.resolve()),
  Meter: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    getValue: jest.fn().mockReturnValue(0),
  })),
  context: {
    currentTime: 0,
  },
};

module.exports = Tone;