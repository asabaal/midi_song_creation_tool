// Placeholder component for tests
import React from 'react';

const PianoRoll = () => {
  return (
    <div data-testid="piano-roll">
      <div data-testid="piano-roll-grid" style={{ backgroundSize: '20px 20px' }}>
        {/* Grid content would go here */}
      </div>
      <button data-testid="zoom-in">Zoom In</button>
      <select data-testid="grid-snap-select">
        <option value="1">1 Beat</option>
        <option value="0.5">1/2 Beat</option>
        <option value="0.25">1/4 Beat</option>
      </select>
    </div>
  );
};

export default PianoRoll;
