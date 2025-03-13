// Mock PianoRoll component for tests
import React from 'react';

const PianoRoll = () => {
  return (
    <div data-testid="piano-roll">
      <div className="piano-roll-controls">
        <button data-testid="zoom-in">Zoom In</button>
        <button data-testid="zoom-out">Zoom Out</button>
        <select data-testid="grid-snap-select">
          <option value="1">1 Beat</option>
          <option value="0.5">1/2 Beat</option>
          <option value="0.25">1/4 Beat</option>
        </select>
      </div>
      <div data-testid="piano-roll-grid">
        <canvas width={800} height={600} />
      </div>
    </div>
  );
};

export default PianoRoll;
