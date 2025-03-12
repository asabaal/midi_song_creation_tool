// Mock for transportService.js
const transportService = {
  // Transport control functions
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  isPlaying: jest.fn().mockReturnValue(false),
  
  // BPM control
  setBpm: jest.fn(),
  getBpm: jest.fn().mockReturnValue(120),
  
  // Time signature control
  setTimeSignature: jest.fn(),
  getTimeSignature: jest.fn().mockReturnValue([4, 4]),
  
  // Position
  getCurrentPosition: jest.fn().mockReturnValue('0:0:0'),
  getPositionTicks: jest.fn().mockReturnValue(0),
  
  // Tick events
  subscribeToTick: jest.fn(),
  unsubscribeFromTick: jest.fn(),
  
  // Loop control
  setLoop: jest.fn(),
  getLoop: jest.fn().mockReturnValue({ enabled: false, start: 0, end: 16 }),
  
  // Transport initialization
  initTransport: jest.fn(),
  
  // Reset all mocks
  _reset: () => {
    Object.keys(transportService).forEach(key => {
      if (typeof transportService[key] === 'function' && transportService[key].mockReset) {
        transportService[key].mockReset();
      }
    });
    
    // Reset default return values
    transportService.isPlaying.mockReturnValue(false);
    transportService.getBpm.mockReturnValue(120);
    transportService.getTimeSignature.mockReturnValue([4, 4]);
    transportService.getCurrentPosition.mockReturnValue('0:0:0');
    transportService.getPositionTicks.mockReturnValue(0);
    transportService.getLoop.mockReturnValue({ enabled: false, start: 0, end: 16 });
  }
};

module.exports = transportService;
