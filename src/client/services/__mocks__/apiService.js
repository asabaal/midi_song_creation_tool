// src/client/services/__mocks__/apiService.js
export const generateChordProgression = jest.fn().mockResolvedValue({
  success: true,
  progression: [
    { root: 'C', octave: 4, chordType: 'major', notes: [60, 64, 67] },
    { root: 'G', octave: 4, chordType: 'major', notes: [67, 71, 74] },
    { root: 'A', octave: 4, chordType: 'minor', notes: [69, 72, 76] },
    { root: 'F', octave: 4, chordType: 'major', notes: [65, 69, 72] }
  ]
});

export const generateBassline = jest.fn().mockResolvedValue({
  success: true,
  bassline: [
    { pitch: 48, startTime: 0, duration: 1, velocity: 100 },
    { pitch: 55, startTime: 1, duration: 1, velocity: 100 },
    { pitch: 57, startTime: 2, duration: 1, velocity: 100 },
    { pitch: 53, startTime: 3, duration: 1, velocity: 100 }
  ]
});

export const generateDrumPattern = jest.fn().mockResolvedValue({
  success: true,
  drumPattern: [
    { pitch: 36, startTime: 0, duration: 0.25, velocity: 100 },
    { pitch: 38, startTime: 1, duration: 0.25, velocity: 90 },
    { pitch: 36, startTime: 2, duration: 0.25, velocity: 100 },
    { pitch: 38, startTime: 3, duration: 0.25, velocity: 90 }
  ]
});

export const generateArpeggio = jest.fn().mockResolvedValue({
  success: true,
  arpeggio: [
    { pitch: 60, startTime: 0, duration: 0.25, velocity: 90 },
    { pitch: 64, startTime: 0.25, duration: 0.25, velocity: 90 },
    { pitch: 67, startTime: 0.5, duration: 0.25, velocity: 90 },
    { pitch: 72, startTime: 0.75, duration: 0.25, velocity: 90 }
  ]
});

export const exportMidiFile = jest.fn().mockResolvedValue({
  success: true,
  filename: 'test-export.mid'
});

export const importMidiFile = jest.fn().mockResolvedValue({
  success: true,
  sequence: {
    id: 'imported-seq',
    name: 'Imported Sequence',
    notes: [
      { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
      { pitch: 64, startTime: 1, duration: 1, velocity: 100 },
      { pitch: 67, startTime: 2, duration: 1, velocity: 100 }
    ]
  }
});

export default {
  generateChordProgression,
  generateBassline,
  generateDrumPattern,
  generateArpeggio,
  exportMidiFile,
  importMidiFile
};
