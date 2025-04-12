// src/components/PatternEditor/PatternEditor.tsx
import React from 'react';
import './PatternEditor.css';

// --- Configuration ---
const NUM_KEYS = 48; // Number of piano keys (e.g., 4 octaves C2-C6)
const NUM_BEATS = 16; // Number of beats/columns in this view (e.g., 4 bars of 4/4)
const START_NOTE = 48; // MIDI note number for the bottom key (e.g., C3)

// --- Helper Functions ---
const getNoteName = (midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1; // MIDI standard C4 is note 60
    const name = noteNames[midiNote % 12];
    // Basic check for black keys for styling
    const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);
    return `${name}${octave}${isBlackKey ? ' sharp' : ''}`;
};

// --- Interfaces ---
interface PianoKeyProps {
    midiNote: number;
}

interface GridCellProps {
    beat: number;
    midiNote: number;
    onClick: (beat: number, midiNote: number) => void;
    // Add state later for whether a note is active/selected here
}

interface PatternEditorProps {
    // Props will be added later for pattern data, callbacks etc.
}

// --- Components ---
const PianoKey: React.FC<PianoKeyProps> = ({ midiNote }) => {
    const noteName = getNoteName(midiNote);
    const isBlackKey = noteName.includes('sharp');
    return (
        <div className={`piano-key ${isBlackKey ? 'black-key' : 'white-key'}`}>
            {/* Optionally display note name */}
            {/* <span>{noteName.replace(' sharp', '')}</span> */}
        </div>
    );
};

const GridCell: React.FC<GridCellProps> = ({ beat, midiNote, onClick }) => {
    // Determine if the cell corresponds to a black key row for subtle background diff
    const isBlackKeyRow = [1, 3, 6, 8, 10].includes(midiNote % 12);
    // Determine if it's an odd or even beat for visual separation
    const isOddBeat = (beat + 1) % 2 !== 0; // +1 because beats are 0-indexed internally

    const handleClick = () => {
        onClick(beat, midiNote);
        // console.log(`Clicked cell: Beat ${beat + 1}, Note ${getNoteName(midiNote)} (${midiNote})`);
    };

    return (
        <div
            className={`grid-cell ${isBlackKeyRow ? 'black-key-row' : ''} ${isOddBeat ? 'odd-beat' : ''}`}
            onClick={handleClick}
            // Add active/selected class later based on pattern data
        >
            {/* Content inside the cell (e.g., a representation of a note) */}
        </div>
    );
};

const PatternEditor: React.FC<PatternEditorProps> = () => {

    const handleCellClick = (beat: number, midiNote: number) => {
        console.log(`Clicked cell: Beat ${beat}, Note ${getNoteName(midiNote)} (${midiNote})`);
        // --- TODO: Add logic here to toggle notes in the pattern state ---
    };

    const renderPianoKeys = () => {
        const keys = [];
        for (let i = 0; i < NUM_KEYS; i++) {
            const midiNote = START_NOTE + NUM_KEYS - 1 - i; // Render from top to bottom
            keys.push(<PianoKey key={midiNote} midiNote={midiNote} />);
        }
        return keys;
    };

    const renderGridCells = () => {
        const cells = [];
        for (let i = 0; i < NUM_KEYS; i++) {
            const midiNote = START_NOTE + NUM_KEYS - 1 - i; // Render rows from top to bottom
            for (let j = 0; j < NUM_BEATS; j++) {
                cells.push(
                    <GridCell
                        key={`${j}-${midiNote}`}
                        beat={j}
                        midiNote={midiNote}
                        onClick={handleCellClick}
                    />
                );
            }
        }
        return cells;
    };

    return (
        <div className="pattern-editor-container">
            <div className="piano-roll-header">
                 {/* Placeholder for beat numbers */}
                 <div className="beat-ruler">
                    {Array.from({ length: NUM_BEATS }).map((_, index) => (
                        <div key={index} className="beat-marker">{index + 1}</div>
                    ))}
                </div>
            </div>
            <div className="piano-roll-body">
                <div className="piano-keys">
                    {renderPianoKeys()}
                </div>
                <div
                    className="grid"
                    style={{ '--num-beats': NUM_BEATS, '--num-keys': NUM_KEYS } as React.CSSProperties}
                >
                    {renderGridCells()}
                </div>
            </div>
        </div>
    );
};

export default PatternEditor;
