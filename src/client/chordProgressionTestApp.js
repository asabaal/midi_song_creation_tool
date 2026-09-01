import React from 'react';
import { createRoot } from 'react-dom/client';
import ChordProgressionExplorer from './components/ChordProgressionExplorer/ChordProgressionExplorer';
import './styles/ChordProgressionExplorer.css';

// Simple test app to render the Chord Progression Explorer
const App = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a', 
      padding: '20px 0' 
    }}>
      <ChordProgressionExplorer />
    </div>
  );
};

// Find the root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Create and render the React app
const root = createRoot(container);
root.render(<App />);