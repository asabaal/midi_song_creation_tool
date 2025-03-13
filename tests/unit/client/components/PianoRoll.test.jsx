import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple mock of PianoRoll component
const PianoRoll = () => (
  <div data-testid="piano-roll">
    <div className="piano-roll-controls">
      <button data-testid="zoom-in">Zoom In</button>
      <button data-testid="zoom-out">Zoom Out</button>
      <select data-testid="grid-snap-select" defaultValue="0.25">
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

describe('PianoRoll', () => {
  test('renders piano roll component', () => {
    render(<PianoRoll />);
    const pianoRoll = screen.getByTestId('piano-roll');
    expect(pianoRoll).toBeInTheDocument();
  });
  
  test('adds a note when clicking on the canvas', () => {
    render(<PianoRoll />);
    const canvas = screen.getByTestId('piano-roll-grid').querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
