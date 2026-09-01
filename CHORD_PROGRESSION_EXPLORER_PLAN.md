# Chord Progression Explorer - Complete Implementation Plan

## Project Overview

The Chord Progression Explorer is a web-based tool that allows users to create, explore, and export chord progressions with support for custom chord creation. This tool will be integrated into the existing `midi_song_creation_tool` repository, leveraging existing music theory components, MIDI export capabilities, and UI patterns.

## Repository Location

**Primary Location**: `/midi_song_creation_tool/src/client/components/ChordProgressionExplorer/`

**Project Structure**:
```
midi_song_creation_tool/
├── src/
│   ├── client/
│   │   ├── components/
│   │   │   ├── ChordProgressionExplorer/     # NEW: Main app component
│   │   │   │   ├── ChordProgressionExplorer.jsx
│   │   │   │   ├── KeySelector.jsx
│   │   │   │   ├── ChordSelector.jsx
│   │   │   │   ├── CustomChordBuilder.jsx
│   │   │   │   ├── ProgressionTimeline.jsx
│   │   │   │   ├── PlaybackControls.jsx
│   │   │   │   ├── DurationSelector.jsx
│   │   │   │   └── ExportControls.jsx
│   │   │   ├── PatternGenerator.jsx          # EXISTING
│   │   │   ├── PianoRoll.jsx                  # EXISTING
│   │   │   └── VirtualKeyboard.jsx            # EXISTING
│   │   ├── services/
│   │   │   ├── chordProgressionService.js     # NEW: API service
│   │   │   └── ...                           # EXISTING services
│   │   ├── styles/
│   │   │   ├── ChordProgressionExplorer.css   # NEW: Main styles
│   │   │   └── ...                           # EXISTING styles
│   │   └── App.jsx                           # NEW: Entry point
│   ├── core/
│   │   ├── chordProgressionGenerator.js       # NEW: Core logic
│   │   ├── customChordValidator.js            # NEW: Custom chord logic
│   │   ├── musicTheory.js                     # EXISTING (extend)
│   │   └── ...                               # EXISTING core modules
│   └── server/
│       ├── routes/
│       │   ├── chordProgressionRoutes.js      # NEW: API endpoints
│       │   └── ...                           # EXISTING routes
│       └── models/
│           ├── chordProgression.js            # NEW: Data model
│           └── ...                           # EXISTING models
├── public/
│   ├── chord-progression-explorer.html       # NEW: Entry point
│   └── index.html                            # EXISTING
└── package.json                              # EXISTING (extend)
```

## Core Features

### 1. Key Selection
- All 12 major and minor keys (24 total)
- Visual key signature display with ♯/♭ symbols
- Real-time diatonic chord updates based on selected key

### 2. Chord Selection & Duration
- Pre-built chord library (major, minor, 7ths, extensions)
- Diatonic chord suggestions based on selected key
- Duration control per chord (whole note, half, quarter, custom)
- Visual timeline showing progression

### 3. Custom Chord Creation
- User-defined chord builder during runtime
- Virtual piano keyboard for note selection
- Automatic chord type detection and analysis
- Save custom chords for session
- Chord validation and suggestions

### 4. Progression Management
- Visual timeline interface
- Drag-and-drop chord reordering
- Edit/delete individual chords
- Real-time playback with Tone.js
- Loop functionality

### 5. Export Capabilities
- MIDI file export using existing `midi-writer-js`
- Progression data export (JSON)
- Integration with existing song creation tool

## UI Design System

### Design Philosophy
- **Dark theme** with green accent color (`#1db954`) matching existing components
- **Modular component structure** following established pattern
- **Tab-based interface** similar to PatternGenerator
- **Consistent styling** with rounded corners, padding, and transitions

### Component Breakdown

#### 1. ChordProgressionExplorer.jsx (Main Container)
```jsx
<div className="chord-progression-explorer">
  <h2>Chord Progression Explorer</h2>
  <KeySelector />
  <ProgressionBuilder />
  <PlaybackControls />
  <ExportControls />
</div>
```

#### 2. KeySelector.jsx
- Dropdown with all 24 keys
- Visual key signature display
- Updates available diatonic chords

#### 3. ProgressionBuilder.jsx
- Timeline visualization
- Chord addition controls
- Custom chord builder toggle
- Duration selector

#### 4. CustomChordBuilder.jsx
- VirtualKeyboard integration
- Selected notes display
- Chord analysis and detection
- Save custom chord functionality

#### 5. ProgressionTimeline.jsx
- Visual chord blocks
- Time markers
- Drag-and-drop editing
- Playback position indicator

#### 6. DurationSelector.jsx
- Preset duration buttons (½, 1, 2, 4 beats)
- Custom duration input
- Visual feedback

### CSS Design System
```css
/* Main Container */
.chord-progression-explorer {
  background-color: #2a2a2a;
  border-radius: 5px;
  padding: 20px;
  color: white;
  margin: 10px 0;
}

/* Headers */
.chord-progression-explorer h2 {
  color: #1db954;
  margin-top: 0;
  margin-bottom: 20px;
}

/* Controls */
.key-selector, .progression-builder {
  background-color: #3a3a3a;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

/* Buttons */
.chord-btn, .duration-btn {
  background-color: #1db954;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* Timeline */
.progression-timeline {
  background-color: #1a1a1a;
  border-radius: 4px;
  padding: 15px;
  margin: 15px 0;
  min-height: 120px;
  position: relative;
}

.chord-block {
  background-color: #1db954;
  border-radius: 3px;
  padding: 8px;
  position: absolute;
  cursor: pointer;
  transition: all 0.2s;
}
```

## Technical Implementation Plan

### Phase 1: Backend Foundation (Week 1)

#### 1.1 Extend Music Theory Module
**File**: `src/core/musicTheory.js`

Add these functions to existing module:
```javascript
// Generate diatonic chords for a key
function generateDiatonicChords(key, mode = 'major') {
  // Use existing generateScale and generateChord functions
  // Return array of chord objects with name, notes, and function
}

// Analyze chord from selected notes
function analyzeChord(notes) {
  // Pattern matching against CHORD_TYPES
  // Return chord type and root if recognized
}

// Validate custom chord
function validateCustomChord(notes) {
  // Check for valid note combinations
  // Return validation result and suggestions
}
```

#### 1.2 Create Chord Progression Generator
**File**: `src/core/chordProgressionGenerator.js`
```javascript
class ChordProgressionGenerator {
  constructor() {
    this.musicTheory = require('./musicTheory');
  }

  // Generate progression from user input
  generateProgression(key, chords, durations) {
    // Convert to MIDI notes with timing
    // Return structured data for playback
  }

  // Export progression to MIDI format
  exportToMIDI(progression) {
    // Use existing midiExport functionality
  }

  // Analyze progression for suggestions
  analyzeProgression(progression) {
    // Suggest next chords based on music theory
  }
}
```

#### 1.3 Add API Routes
**File**: `src/server/routes/chordProgressionRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const ChordProgressionGenerator = require('../../core/chordProgressionGenerator');

// GET /api/chord-progression/diatonic-chords/:key
router.get('/diatonic-chords/:key', (req, res) => {
  // Return available chords in key
});

// POST /api/chord-progression/analyze-custom
router.post('/analyze-custom', (req, res) => {
  // Analyze user-selected notes
});

// POST /api/chord-progression/generate
router.post('/generate', (req, res) => {
  // Generate MIDI from progression
});

// POST /api/chord-progression/export
router.post('/export', (req, res) => {
  // Export as MIDI file
});

module.exports = router;
```

#### 1.4 Update Server Configuration
**File**: `src/server/app.js`
```javascript
// Add new route
const chordProgressionRoutes = require('./routes/chordProgressionRoutes');
app.use('/api/chord-progression', chordProgressionRoutes);
```

### Phase 2: Frontend Components (Week 2)

#### 2.1 Main Component
**File**: `src/client/components/ChordProgressionExplorer/ChordProgressionExplorer.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import KeySelector from './KeySelector';
import ProgressionBuilder from './ProgressionBuilder';
import PlaybackControls from './PlaybackControls';
import ExportControls from './ExportControls';
import * as chordProgressionService from '../../services/chordProgressionService';

const ChordProgressionExplorer = () => {
  const [selectedKey, setSelectedKey] = useState('C major');
  const [progression, setProgression] = useState([]);
  const [diatonicChords, setDiatonicChords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load diatonic chords when key changes
  useEffect(() => {
    chordProgressionService.getDiatonicChords(selectedKey)
      .then(setDiatonicChords);
  }, [selectedKey]);

  return (
    <div className="chord-progression-explorer">
      <h2>Chord Progression Explorer</h2>
      <KeySelector 
        selectedKey={selectedKey}
        onKeyChange={setSelectedKey}
      />
      <ProgressionBuilder 
        key={selectedKey}
        diatonicChords={diatonicChords}
        progression={progression}
        onProgressionChange={setProgression}
      />
      <PlaybackControls 
        progression={progression}
        isPlaying={isPlaying}
        onPlayStateChange={setIsPlaying}
      />
      <ExportControls progression={progression} />
    </div>
  );
};

export default ChordProgressionExplorer;
```

#### 2.2 Key Selector Component
**File**: `src/client/components/ChordProgressionExplorer/KeySelector.jsx`
```jsx
import React from 'react';

const KeySelector = ({ selectedKey, onKeyChange }) => {
  const keys = [
    'C major', 'G major', 'D major', 'A major', 'E major', 'B major',
    'F# major', 'C# major', 'F major', 'Bb major', 'Eb major', 'Ab major',
    'Db major', 'Gb major', 'Cb major',
    'A minor', 'E minor', 'B minor', 'F# minor', 'C# minor', 'G# minor',
    'D# minor', 'A# minor', 'D minor', 'G minor', 'C minor', 'F minor',
    'Bb minor', 'Eb minor', 'Ab minor'
  ];

  return (
    <div className="key-selector">
      <label>Key:</label>
      <select 
        value={selectedKey} 
        onChange={(e) => onKeyChange(e.target.value)}
        className="key-dropdown"
      >
        {keys.map(key => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>
      <KeySignatureDisplay key={selectedKey} />
    </div>
  );
};

export default KeySelector;
```

#### 2.3 Custom Chord Builder
**File**: `src/client/components/ChordProgressionExplorer/CustomChordBuilder.jsx`
```jsx
import React, { useState } from 'react';
import VirtualKeyboard from '../VirtualKeyboard';
import * as chordProgressionService from '../../services/chordProgressionService';

const CustomChordBuilder = ({ onChordCreated }) => {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [chordAnalysis, setChordAnalysis] = useState(null);
  const [chordName, setChordName] = useState('');

  const handleNoteSelection = (note) => {
    const newNotes = selectedNotes.includes(note)
      ? selectedNotes.filter(n => n !== note)
      : [...selectedNotes, note];
    
    setSelectedNotes(newNotes);
    
    // Analyze chord if we have enough notes
    if (newNotes.length >= 2) {
      chordProgressionService.analyzeCustomChord(newNotes)
        .then(setChordAnalysis);
    }
  };

  const saveCustomChord = () => {
    if (selectedNotes.length >= 2 && chordName) {
      onChordCreated({
        name: chordName,
        notes: selectedNotes,
        analysis: chordAnalysis
      });
    }
  };

  return (
    <div className="custom-chord-builder">
      <h4>Build Custom Chord</h4>
      <VirtualKeyboard 
        octaves={1}
        startOctave={4}
        showNoteNames={true}
        activeNotes={selectedNotes}
        onNoteOn={handleNoteSelection}
        onNoteOff={handleNoteSelection}
      />
      <div className="selected-notes">
        {selectedNotes.map(note => <span key={note}>{note}</span>)}
      </div>
      {chordAnalysis && (
        <div className="chord-analysis">
          <p>Detected: <span className="chord-type">{chordAnalysis.type}</span></p>
        </div>
      )}
      <div className="custom-chord-controls">
        <input 
          placeholder="Chord name" 
          value={chordName}
          onChange={(e) => setChordName(e.target.value)}
        />
        <button onClick={saveCustomChord}>Save Chord</button>
      </div>
    </div>
  );
};

export default CustomChordBuilder;
```

#### 2.4 API Service
**File**: `src/client/services/chordProgressionService.js`
```javascript
import * as apiService from './apiService';

export const getDiatonicChords = (key) => {
  return apiService.get(`/chord-progression/diatonic-chords/${key}`);
};

export const analyzeCustomChord = (notes) => {
  return apiService.post('/chord-progression/analyze-custom', { notes });
};

export const generateProgression = (key, progression) => {
  return apiService.post('/chord-progression/generate', { key, progression });
};

export const exportProgression = (progression, format = 'midi') => {
  return apiService.post('/chord-progression/export', { progression, format });
};
```

### Phase 3: Advanced Components (Week 3)

#### 3.1 Progression Timeline
**File**: `src/client/components/ChordProgressionExplorer/ProgressionTimeline.jsx`
- Visual chord blocks with drag-and-drop
- Time markers and grid
- Playback position indicator
- Edit/delete functionality

#### 3.2 Chord Selector
**File**: `src/client/components/ChordProgressionExplorer/ChordSelector.jsx`
- Diatonic chord grid
- Extended chord options
- Custom chord integration
- Recent chords history

#### 3.3 Duration Selector
**File**: `src/client/components/ChordProgressionExplorer/DurationSelector.jsx`
- Preset duration buttons
- Custom duration input
- Visual feedback

### Phase 4: Integration & Playback (Week 4)

#### 4.1 Playback Controls
**File**: `src/client/components/ChordProgressionExplorer/PlaybackControls.jsx`
- Play/pause/stop controls
- Tempo adjustment
- Loop functionality
- Progress indicator

#### 4.2 Export Controls
**File**: `src/client/components/ChordProgressionExplorer/ExportControls.jsx`
- MIDI export functionality
- Progression data export
- Integration with existing tools

#### 4.3 Main App Integration
**File**: `src/client/App.jsx`
```jsx
import React from 'react';
import ChordProgressionExplorer from './components/ChordProgressionExplorer/ChordProgressionExplorer';
import './styles/main.css';

const App = () => {
  return (
    <div className="app">
      <ChordProgressionExplorer />
    </div>
  );
};

export default App;
```

#### 4.4 Entry Point
**File**: `public/chord-progression-explorer.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chord Progression Explorer</title>
</head>
<body>
    <div id="root"></div>
    <script src="dist/chord-progression-explorer.js"></script>
</body>
</html>
```

### Phase 5: Testing & Polish (Week 5)

#### 5.1 Unit Tests
**File**: `tests/unit/client/components/ChordProgressionExplorer.test.jsx`
```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChordProgressionExplorer from '../../../../src/client/components/ChordProgressionExplorer/ChordProgressionExplorer';

describe('ChordProgressionExplorer', () => {
  test('renders main components', () => {
    render(<ChordProgressionExplorer />);
    expect(screen.getByText('Chord Progression Explorer')).toBeInTheDocument();
    expect(screen.getByText('Key:')).toBeInTheDocument();
  });

  test('key selection updates available chords', async () => {
    // Mock API calls and test state changes
  });
});
```

#### 5.2 Integration Tests
**File**: `tests/integration/chordProgression.test.js`
```javascript
describe('Chord Progression Integration', () => {
  test('full workflow from key selection to MIDI export', async () => {
    // Test complete user journey
  });
});
```

#### 5.3 Build Configuration
**File**: `webpack.config.js` (extend existing)
```javascript
module.exports = {
  // Add new entry point
  entry: {
    'main': './src/client/index.js',
    'chord-progression-explorer': './src/client/chordProgressionExplorer.js'
  },
  // Output configuration for multiple bundles
  output: {
    filename: 'dist/[name].js',
    path: path.resolve(__dirname, 'public')
  }
};
```

## Dependencies

### New Dependencies to Add:
```json
{
  "dependencies": {
    "react-beautiful-dnd": "^13.1.1" // For timeline drag-and-drop
  }
}
```

### Existing Dependencies to Leverage:
- `react` - UI framework
- `tone` - Audio playback and synthesis
- `midi-writer-js` - MIDI file generation
- `express` - Backend API
- `mongoose` - Database (if needed for saving custom chords)

## User Interaction Flow

1. **Select Key** → Key selector updates available diatonic chords
2. **Add Chord** → Choose from diatonic chords or build custom
3. **Set Duration** → Use preset buttons or custom input
4. **Visualize** → Chord appears on timeline with duration
5. **Playback** → Hear progression with Tone.js
6. **Edit** → Click chord blocks to modify/delete
7. **Export** → Save as MIDI file

## State Management

```jsx
const [selectedKey, setSelectedKey] = useState('C major');
const [progression, setProgression] = useState([]);
const [selectedChord, setSelectedChord] = useState(null);
const [customChords, setCustomChords] = useState([]);
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [tempo, setTempo] = useState(120);
const [loopEnabled, setLoopEnabled] = useState(false);
```

## API Endpoints

### GET `/api/chord-progression/diatonic-chords/:key`
- Returns available diatonic chords for selected key
- Response: `{ chords: [{ name, notes, function }, ...] }`

### POST `/api/chord-progression/analyze-custom`
- Analyzes user-selected notes for chord type
- Request: `{ notes: [midiNumbers] }`
- Response: `{ type, root, confidence, suggestions }`

### POST `/api/chord-progression/generate`
- Generates MIDI data from progression
- Request: `{ key, progression: [{ chord, duration, startTime }] }`
- Response: `{ midiData, totalTime }`

### POST `/api/chord-progression/export`
- Exports progression as MIDI file
- Request: `{ progression, format }`
- Response: `{ fileUrl, filename }`

## Testing Strategy

### Unit Tests
- Component rendering and state management
- Music theory function validation
- API service mocking and testing

### Integration Tests
- Full user workflow testing
- API endpoint integration
- MIDI export functionality

### E2E Tests
- Complete user journeys
- Cross-browser compatibility
- Performance testing

## Performance Considerations

- Virtual keyboard optimization for smooth interaction
- Timeline rendering with large progressions
- Audio playback buffer management
- MIDI export optimization for large files

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- ARIA labels for interactive elements

## Responsive Design

- Mobile-friendly chord selection
- Touch-optimized timeline interaction
- Adaptive layout for different screen sizes
- Progressive enhancement for older browsers

## Future Enhancements

### Version 2.0 Features
- AI-powered chord suggestions
- Advanced harmonic analysis
- Collaboration features
- Cloud storage integration
- Advanced rhythmic patterns

### Integration Opportunities
- Direct integration with existing song creation tool
- Plugin architecture for custom chord types
- API for third-party integrations
- Real-time collaboration

## Documentation

### Developer Documentation
- Component API documentation
- Music theory function reference
- API endpoint documentation
- Contributing guidelines

### User Documentation
- Getting started guide
- Feature tutorials
- FAQ and troubleshooting
- Video tutorials

## Deployment

### Development Environment
- Local development server with hot reload
- Mock API responses for offline development
- Component storybook for UI testing

### Production Deployment
- Static file hosting for frontend
- Node.js server for API
- Database setup for persistent storage
- CI/CD pipeline configuration

---

## Implementation Checklist

### Phase 1: Backend Foundation
- [ ] Extend `musicTheory.js` with new functions
- [ ] Create `chordProgressionGenerator.js`
- [ ] Add API routes in `chordProgressionRoutes.js`
- [ ] Update server configuration
- [ ] Test API endpoints

### Phase 2: Frontend Components
- [ ] Create main `ChordProgressionExplorer` component
- [ ] Implement `KeySelector` component
- [ ] Build `CustomChordBuilder` component
- [ ] Create API service layer
- [ ] Add basic styling

### Phase 3: Advanced Components
- [ ] Implement `ProgressionTimeline` with drag-and-drop
- [ ] Create `ChordSelector` with diatonic chords
- [ ] Build `DurationSelector` component
- [ ] Add responsive design

### Phase 4: Integration & Playback
- [ ] Implement `PlaybackControls` with Tone.js
- [ ] Create `ExportControls` for MIDI export
- [ ] Integrate with main application
- [ ] Add entry point and build configuration

### Phase 5: Testing & Polish
- [ ] Write unit tests for all components
- [ ] Create integration tests
- [ ] Add E2E tests for user workflows
- [ ] Performance optimization
- [ ] Documentation and deployment

---

This comprehensive plan provides a complete roadmap for implementing the Chord Progression Explorer, leveraging existing infrastructure while adding powerful new functionality for music creation and exploration.