// Placeholder component for tests
import React from 'react';

const TransportControls = () => {
  return (
    <div data-testid="transport-controls">
      <button data-testid="play-button">Play</button>
      <button data-testid="pause-button" style={{ display: 'none' }}>Pause</button>
      <button data-testid="stop-button">Stop</button>
      <input data-testid="tempo-input" defaultValue="120" type="number" />
      <input data-testid="loop-toggle" type="checkbox" />
      <select data-testid="time-signature-select">
        <option value="4/4">4/4</option>
        <option value="3/4">3/4</option>
        <option value="6/8">6/8</option>
      </select>
    </div>
  );
};

export default TransportControls;
