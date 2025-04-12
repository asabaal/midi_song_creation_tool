/**
 * Pattern Editor Store
 * 
 * This module provides a Zustand-based state management store for the pattern editor.
 * It handles state updates, undo/redo functionality, and operations on the pattern.
 * 
 * @module patternEditorStore
 */

import { create } from 'zustand';
import { PatternModel, Pattern, MIDINote } from '../models/Pattern';

/**
 * View settings for the pattern editor
 * 
 * These settings control how the pattern is displayed in the editor.
 * 
 * @interface PatternEditorViewSettings
 */
interface PatternEditorViewSettings {
  /** Start beat of the visible area */
  startBeat: number;
  
  /** End beat of the visible area */
  endBeat: number;
  
  /** Lowest note pitch visible */
  lowestNote: number;
  
  /** Highest note pitch visible */
  highestNote: number;
  
  /** Grid size for snapping in ticks */
  snapToGrid: number;
  
  /** Whether to show velocity lane */
  showVelocity: boolean;
}

/**
 * History state for undo/redo functionality
 * 
 * @interface PatternEditorHistory
 */
export interface PatternEditorHistory {
  /** Past states for undo */
  past: Pattern[];
  
  /** Current pattern state */
  current: Pattern;
  
  /** Future states for redo */
  future: Pattern[];
}

/**
 * Pattern Editor Store interface
 * 
 * This interface defines all state and methods available in the pattern editor store.
 * 
 * @interface PatternEditorStore
 */
interface PatternEditorStore {
  // State
  /** History state for undo/redo */
  history: PatternEditorHistory;
  
  /** Currently selected note IDs */
  selection: string[];
  
  /** View settings for the editor */
  viewSettings: PatternEditorViewSettings;
  
  /** Current cursor position */
  cursor: { beat: number; pitch: number };
  
  // Current state accessors (derived from history)
  /** Gets the current pattern */
  getCurrentPattern: () => Pattern;
  
  /** Gets currently selected notes */
  getSelectedNotes: () => MIDINote[];
  
  /** Gets notes visible in the current viewport */
  getNotesInViewport: () => MIDINote[];
  
  // Basic pattern operations
  /** Creates a new pattern */
  createNewPattern: (name?: string) => void;
  
  /** Loads an existing pattern */
  loadPattern: (pattern: Pattern) => void;
  
  // Note operations
  /** Adds a new note to the pattern */
  addNote: (pitch: number, startTime: number, duration: number, velocity: number) => void;
  
  /** Removes a note from the pattern */
  removeNote: (noteId: string) => void;
  
  /** Updates properties of an existing note */
  updateNote: (noteId: string, changes: Partial<Omit<MIDINote, 'id'>>) => void;
  
  // Selection operations
  /** Selects specific notes by ID */
  selectNotes: (noteIds: string[]) => void;
  
  /** Selects notes within a specific range */
  selectNotesInRange: (startBeat: number, endBeat: number, minPitch: number, maxPitch: number) => void;
  
  /** Clears the current selection */
  clearSelection: () => void;
  
  // Edit operations
  /** Duplicates selected notes */
  duplicateSelectedNotes: (offsetTicks?: number) => void;
  
  /** Quantizes selected notes to grid */
  quantizeSelectedNotes: (gridSize?: number, strength?: number) => void;
  
  /** Transposes selected notes by semitones */
  transposeSelectedNotes: (semitones: number) => void;
  
  /** Sets velocity for selected notes */
  setSelectedNotesVelocity: (velocity: number) => void;
  
  // View settings
  /** Sets the visible viewport area */
  setViewport: (startBeat: number, endBeat: number, lowestNote: number, highestNote: number) => void;
  
  /** Sets the grid snap size */
  setSnapToGrid: (snapToGrid: number) => void;
  
  /** Toggles velocity lane visibility */
  setShowVelocity: (show: boolean) => void;
  
  // History operations
  /** Undoes the last action */
  undo: () => void;
  
  /** Redoes a previously undone action */
  redo: () => void;
  
  /** Saves current state to history */
  saveToHistory: (pattern: Pattern) => void;
}

/**
 * Default view settings for the pattern editor
 */
const DEFAULT_VIEW_SETTINGS: PatternEditorViewSettings = {
  startBeat: 0,
  endBeat: 16,
  lowestNote: 36,  // C2
  highestNote: 84, // C6
  snapToGrid: 120, // 16th note at 480 PPQ
  showVelocity: true
};

/**
 * Default cursor position
 */
const DEFAULT_CURSOR = { beat: 0, pitch: 60 };

/**
 * Maximum history size for memory management
 */
const MAX_HISTORY_SIZE = 50;

/**
 * Create the store
 * 
 * This creates a Zustand store with all the state and methods for the pattern editor.
 */
export const usePatternEditorStore = create<PatternEditorStore>((set, get) => ({
  // Initial state
  history: {
    past: [],
    current: PatternModel.createEmptyPattern(),
    future: []
  },
  selection: [],
  viewSettings: DEFAULT_VIEW_SETTINGS,
  cursor: DEFAULT_CURSOR,
  
  // Current state accessors
  /**
   * Gets the current pattern
   * 
   * @returns The current pattern
   */
  getCurrentPattern: () => get().history.current,
  
  /**
   * Gets currently selected notes
   * 
   * @returns Array of selected MIDINote objects
   */
  getSelectedNotes: () => {
    const pattern = get().history.current;
    const selectionSet = new Set(get().selection);
    return pattern.notes.filter(note => selectionSet.has(note.id));
  },
  
  /**
   * Gets notes visible in the current viewport
   * 
   * This is a key method that could benefit from WebAssembly optimization
   * as it's frequently called during rendering.
   * 
   * @returns Array of MIDINote objects in the viewport
   */
  getNotesInViewport: () => {
    try {
      const pattern = get().history.current;
      const { startBeat, endBeat, lowestNote, highestNote } = get().viewSettings;
      const startTick = PatternModel.beatToTicks(pattern, startBeat);
      const endTick = PatternModel.beatToTicks(pattern, endBeat);
      
      // Get notes in time range first (should be fewer than all notes)
      const notesInTimeRange = PatternModel.getNotesInTimeRange(pattern, startTick, endTick);
      
      // Then filter by pitch
      return notesInTimeRange.filter(note => 
        note.pitch >= lowestNote && note.pitch <= highestNote
      );
    } catch (error) {
      console.error("Error getting notes in viewport:", error);
      return [];
    }
  },
  
  // Basic pattern operations
  /**
   * Creates a new pattern
   * 
   * @param name - Optional name for the pattern
   */
  createNewPattern: (name = 'New Pattern') => {
    try {
      const newPattern = PatternModel.createEmptyPattern(name);
      set(state => ({
        history: {
          past: [],
          current: newPattern,
          future: []
        },
        selection: []
      }));
    } catch (error) {
      console.error("Error creating new pattern:", error);
    }
  },
  
  /**
   * Loads an existing pattern
   * 
   * @param pattern - The pattern to load
   */
  loadPattern: (pattern) => {
    if (!pattern) {
      console.error("Invalid pattern provided to loadPattern");
      return;
    }
    
    try {
      set(state => ({
        history: {
          past: [],
          current: pattern,
          future: []
        },
        selection: []
      }));
    } catch (error) {
      console.error("Error loading pattern:", error);
    }
  },
  
  // Note operations
  /**
   * Adds a new note to the pattern
   * 
   * @param pitch - MIDI pitch (0-127)
   * @param startTime - Start time in ticks
   * @param duration - Duration in ticks
   * @param velocity - MIDI velocity (1-127)
   */
  addNote: (pitch, startTime, duration, velocity) => {
    try {
      const pattern = get().history.current;
      const noteData = { pitch, startTime, duration, velocity };
      const updatedPattern = PatternModel.addNote(pattern, noteData);
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  },
  
  /**
   * Removes a note from the pattern
   * 
   * @param noteId - ID of the note to remove
   */
  removeNote: (noteId) => {
    try {
      const pattern = get().history.current;
      const updatedPattern = PatternModel.removeNote(pattern, noteId);
      
      // Update selection
      const newSelection = get().selection.filter(id => id !== noteId);
      
      set(state => ({
        selection: newSelection
      }));
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error removing note:", error);
    }
  },
  
  /**
   * Updates properties of an existing note
   * 
   * @param noteId - ID of the note to update
   * @param changes - Properties to update
   */
  updateNote: (noteId, changes) => {
    try {
      const pattern = get().history.current;
      const updatedPattern = PatternModel.updateNote(pattern, noteId, changes);
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  },
  
  // Selection operations
  /**
   * Selects specific notes by ID
   * 
   * This implementation only updates the store's selection state,
   * not the pattern's internal selection state.
   * 
   * @param noteIds - IDs of notes to select
   */
  selectNotes: (noteIds) => {
    try {
      set(state => ({
        selection: noteIds
      }));
    } catch (error) {
      console.error("Error selecting notes:", error);
    }
  },
  
  /**
   * Selects notes within a specific range
   * 
   * @param startBeat - Start beat of selection range
   * @param endBeat - End beat of selection range
   * @param minPitch - Minimum pitch to include
   * @param maxPitch - Maximum pitch to include
   */
  selectNotesInRange: (startBeat, endBeat, minPitch, maxPitch) => {
    try {
      const pattern = get().history.current;
      const startTick = PatternModel.beatToTicks(pattern, startBeat);
      const endTick = PatternModel.beatToTicks(pattern, endBeat);
      
      // First get notes in time range
      const notesInTimeRange = PatternModel.getNotesInTimeRange(pattern, startTick, endTick);
      
      // Then filter by pitch range
      const notesInRange = notesInTimeRange.filter(note => 
        note.pitch >= minPitch && note.pitch <= maxPitch
      );
      
      // Update selection with IDs
      set(state => ({
        selection: notesInRange.map(note => note.id)
      }));
    } catch (error) {
      console.error("Error selecting notes in range:", error);
    }
  },
  
  /**
   * Clears the current selection
   */
  clearSelection: () => {
    try {
      set(state => ({
        selection: []
      }));
    } catch (error) {
      console.error("Error clearing selection:", error);
    }
  },
  
  // Edit operations
  /**
   * Duplicates selected notes
   * 
   * @param offsetTicks - Optional offset in ticks for the duplicated notes
   */
  duplicateSelectedNotes: (offsetTicks = 0) => {
    try {
      const pattern = get().history.current;
      const selectedIds = get().selection;
      
      if (selectedIds.length === 0) return;
      
      // First select the notes in the pattern
      const patternWithSelection = PatternModel.selectNotes(
        pattern, 
        selectedIds
      );
      
      // Then duplicate them
      const updatedPattern = PatternModel.duplicateSelectedNotes(
        patternWithSelection,
        offsetTicks
      );
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error duplicating selected notes:", error);
    }
  },
  
  /**
   * Quantizes selected notes to grid
   * 
   * @param gridSize - Optional grid size in ticks
   * @param strength - Optional quantization strength (0.0-1.0)
   */
  quantizeSelectedNotes: (gridSize, strength = 1.0) => {
    try {
      const pattern = get().history.current;
      const selectedIds = get().selection;
      
      if (selectedIds.length === 0) return;
      
      // Use provided grid size or default to store's snap setting
      const grid = gridSize || get().viewSettings.snapToGrid;
      
      const updatedPattern = PatternModel.quantizeNotes(
        pattern,
        selectedIds,
        grid,
        true,  // quantize start times
        false, // don't quantize durations
        strength
      );
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error quantizing selected notes:", error);
    }
  },
  
  /**
   * Transposes selected notes by semitones
   * 
   * @param semitones - Number of semitones to transpose (positive or negative)
   */
  transposeSelectedNotes: (semitones) => {
    try {
      const pattern = get().history.current;
      const selectedIds = get().selection;
      
      if (selectedIds.length === 0 || semitones === 0) return;
      
      const updatedPattern = PatternModel.transposeNotes(
        pattern,
        selectedIds,
        semitones
      );
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error transposing selected notes:", error);
    }
  },
  
  /**
   * Sets velocity for selected notes
   * 
   * @param velocity - New MIDI velocity value (1-127)
   */
  setSelectedNotesVelocity: (velocity) => {
    try {
      const pattern = get().history.current;
      const selectedIds = get().selection;
      
      if (selectedIds.length === 0) return;
      
      const updatedPattern = PatternModel.setNotesVelocity(
        pattern,
        selectedIds,
        velocity
      );
      
      // Save to history
      get().saveToHistory(updatedPattern);
    } catch (error) {
      console.error("Error setting selected notes velocity:", error);
    }
  },
  
  // View settings
  /**
   * Sets the visible viewport area
   * 
   * @param startBeat - Start beat of viewport
   * @param endBeat - End beat of viewport
   * @param lowestNote - Lowest note pitch to show
   * @param highestNote - Highest note pitch to show
   */
  setViewport: (startBeat, endBeat, lowestNote, highestNote) => {
    try {
      // Validate inputs
      if (startBeat >= endBeat || lowestNote >= highestNote) {
        console.warn("Invalid viewport settings");
        return;
      }
      
      set(state => ({
        viewSettings: {
          ...state.viewSettings,
          startBeat,
          endBeat,
          lowestNote,
          highestNote
        }
      }));
    } catch (error) {
      console.error("Error setting viewport:", error);
    }
  },
  
  /**
   * Sets the grid snap size
   * 
   * @param snapToGrid - Grid size in ticks
   */
  setSnapToGrid: (snapToGrid) => {
    try {
      if (snapToGrid <= 0) {
        console.warn("Invalid snap to grid value");
        return;
      }
      
      set(state => ({
        viewSettings: {
          ...state.viewSettings,
          snapToGrid
        }
      }));
    } catch (error) {
      console.error("Error setting snap to grid:", error);
    }
  },
  
  /**
   * Toggles velocity lane visibility
   * 
   * @param show - Whether to show velocity lane
   */
  setShowVelocity: (show) => {
    try {
      set(state => ({
        viewSettings: {
          ...state.viewSettings,
          showVelocity: show
        }
      }));
    } catch (error) {
      console.error("Error setting show velocity:", error);
    }
  },
  
  // History operations
  /**
   * Undoes the last action
   */
  undo: () => {
    try {
      set(state => {
        const { past, current, future } = state.history;
        
        if (past.length === 0) return state; // Nothing to undo
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        
        return {
          history: {
            past: newPast,
            current: previous,
            future: [current, ...future]
          }
        };
      });
    } catch (error) {
      console.error("Error during undo:", error);
    }
  },
  
  /**
   * Redoes a previously undone action
   */
  redo: () => {
    try {
      set(state => {
        const { past, current, future } = state.history;
        
        if (future.length === 0) return state; // Nothing to redo
        
        const next = future[0];
        const newFuture = future.slice(1);
        
        return {
          history: {
            past: [...past, current],
            current: next,
            future: newFuture
          }
        };
      });
    } catch (error) {
      console.error("Error during redo:", error);
    }
  },
  
  /**
   * Saves current state to history
   * 
   * @param pattern - Pattern to save to history
   */
  saveToHistory: (pattern) => {
    try {
      set(state => {
        const { past, current } = state.history;
        
        // Limit history size to prevent memory issues
        const newPast = [...past, current];
        if (newPast.length > MAX_HISTORY_SIZE) {
          newPast.shift(); // Remove oldest item
        }
        
        return {
          history: {
            past: newPast,
            current: pattern,
            future: [] // Clear redo stack
          }
        };
      });
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  }
}));