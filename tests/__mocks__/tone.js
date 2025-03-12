// tests/__mocks__/tone.js - Mock for the Tone.js library

// Create basic mocks for common Tone.js functionality
const Tone = {
  // Transport functionality
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    position: "0:0:0",
    bpm: {
      value: 120,
      rampTo: jest.fn((value, time) => {
        Tone.Transport.bpm.value = value;
      })
    },
    timeSignature: 4,
    setLoopPoints: jest.fn(),
    loop: false,
    setLoopPoints: jest.fn(),
    setLoop: jest.fn((state) => {
      Tone.Transport.loop = state;
    }),
    scheduleRepeat: jest.fn(),
    scheduleOnce: jest.fn(),
    clear: jest.fn(),
    cancel: jest.fn(),
  },
  
  // Tone.js synths
  Synth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    set: jest.fn(),
    dispose: jest.fn(),
  })),
  
  PolySynth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    set: jest.fn(),
    dispose: jest.fn(),
  })),
  
  // Audio effects
  Reverb: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    connect: jest.fn().mockReturnThis(),
    receive: jest.fn().mockReturnThis(),
    set: jest.fn(),
    dispose: jest.fn(),
  })),
  
  Delay: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    connect: jest.fn().mockReturnThis(),
    receive: jest.fn().mockReturnThis(),
    set: jest.fn(),
    dispose: jest.fn(),
  })),
  
  // Time conversion utilities
  Time: jest.fn((time) => time),
  Frequency: jest.fn((freq) => freq),
  
  // Context and startup
  start: jest.fn().mockResolvedValue(undefined),
  loaded: Promise.resolve(),
  getDestination: jest.fn().mockReturnValue({
    volume: {
      value: 0,
      rampTo: jest.fn(),
    },
  }),
  
  // Part and Sequence for scheduled events
  Part: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    add: jest.fn(),
    clear: jest.fn(),
    dispose: jest.fn(),
  })),
  
  Sequence: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    events: [],
    dispose: jest.fn(),
  })),
  
  // Audio recording
  Recorder: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn().mockResolvedValue(new Blob()),
    dispose: jest.fn(),
  })),
  
  // For MIDI note conversion
  Midi: jest.fn().mockImplementation(() => ({
    toFrequency: jest.fn((note) => 440 * Math.pow(2, (note - 69) / 12)),
    fromFrequency: jest.fn((freq) => Math.round(12 * Math.log2(freq / 440) + 69)),
  })),
  
  // For debugging
  now: jest.fn(() => Date.now() / 1000),
  immediate: jest.fn(() => 0),
};

module.exports = Tone;