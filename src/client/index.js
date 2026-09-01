import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/ChordProgressionExplorer.css';
import ChordProgressionExplorer from './components/ChordProgressionExplorer/ChordProgressionExplorer';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<ChordProgressionExplorer />);