// tests/__mocks__/tone.js

// Mock Transport object
const Transport = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  setLoopPoints: jest.fn(),
  bpm: {
    value: 120,
    set: jest.fn()
  },
  loop: false,
  timeSignature: 4,
  position: '0:0:0',
  state: 'stopped',
  on: jest.fn(),
  off: jest.fn(),
  cancel: jest.fn(),
  schedule: jest.fn(),
};

// Mock context
const context = {
  currentTime: 0,
  resume: jest.fn().mockResolvedValue(undefined),
  state: 'running',
};

// Mock other Tone objects/methods
const Synth = jest.fn().mockImplementation(() => ({
  toDestination: jest.fn().mockReturnThis(),
  triggerAttackRelease: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  dispose: jest.fn(),
}));

const PolySynth = jest.fn().mockImplementation(() => ({
  toDestination: jest.fn().mockReturnThis(),
  triggerAttackRelease: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  dispose: jest.fn(),
}));

const Channel = jest.fn().mockImplementation(() => ({
  toDestination: jest.fn().mockReturnThis(),
  volume: { value: 0 },
  receive: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  dispose: jest.fn(),
}));

const Destination = {
  volume: { value: 0 },
  mute: false,
};

const start = jest.fn().mockResolvedValue(undefined);
const now = jest.fn().mockReturnValue(0);

module.exports = {
  Transport,
  context,
  Synth,
  PolySynth,
  Channel,
  Destination,
  start,
  now,
};
