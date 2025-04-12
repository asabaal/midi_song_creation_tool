/**
 * Pattern data model for MIDI pattern editor
 * 
 * This module contains the core data structures and operations for working with
 * MIDI patterns. It follows an immutable update pattern to support undo/redo
 * functionality and uses efficient operations optimized for future WebAssembly
 * acceleration.
 * 
 * @module Pattern
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a single MIDI note in a pattern
 * 
 * @interface MIDINote
 */
export interface MIDINote {
  /** Unique identifier for the note */
  id: string;
  
  /** MIDI pitch value (0-127) */
  pitch: number;
  
  /** Start time in ticks from the beginning of the pattern */
  startTime: number;
  
  /** Duration in ticks */
  duration: number;
  
  /** MIDI velocity (0-127) */
  velocity: number;
  
  /** Whether the note is currently selected */
  selected?: boolean;
}

/**
 * Represents a complete MIDI pattern
 * 
 * @interface Pattern
 */
export interface Pattern {
  /** Unique identifier for the pattern */
  id: string;
  
  /** Display name of the pattern */
  name: string;
  
  /** Collection of notes within the pattern */
  notes: MIDINote[];
  
  /** Time signature as [numerator, denominator] */
  timeSignature: [number, number];
  
  /** Resolution in ticks per beat (e.g., 480) */
  ticksPerBeat: number;
  
  /** Total length of the pattern in ticks */
  length: number;
}

/**
 * Collection of operations for working with Pattern objects
 * 
 * Operations follow an immutable update pattern, returning new Pattern objects
 * rather than modifying existing ones. This enables easy undo/redo functionality.
 * 
 * Performance-critical methods are annotated for potential WebAssembly optimization.
 */
export class PatternModel {
  /** Default ticks per beat (standard MIDI resolution) */
  static DEFAULT_TICKS_PER_BEAT = 480;
  
  /** Default time signature (4/4) */
  static DEFAULT_TIME_SIGNATURE: [number, number] = [4, 4];
  
  /** Default length in measures for new patterns */
  static DEFAULT_LENGTH_IN_MEASURES = 4;

  /**
   * Creates a new empty pattern with default settings
   * 
   * @param name - Optional name for the pattern
   * @returns A new empty Pattern object
   */
  static createEmptyPattern(name = 'New Pattern'): Pattern {
    try {
      const ticksPerBeat = this.DEFAULT_TICKS_PER_BEAT;
      const timeSignature = [...this.DEFAULT_TIME_SIGNATURE] as [number, number];
      const measuresCount = this.DEFAULT_LENGTH_IN_MEASURES;
      const beatsPerMeasure = timeSignature[0];
      const length = measuresCount * beatsPerMeasure * ticksPerBeat;

      return {
        id: uuidv4(),
        name,
        notes: [],
        timeSignature,
        ticksPerBeat,
        length
      };
    } catch (error) {
      console.error("Error creating empty pattern:", error);
      // Return a minimal valid pattern even if UUID generation fails
      return {
        id: `fallback-${Date.now()}`,
        name,
        notes: [],
        timeSignature: [4, 4],
        ticksPerBeat: 480,
        length: 7680
      };
    }
  }

  /**
   * Adds a note to the pattern
   * 
   * @param pattern - The source pattern
   * @param noteData - The note data to add (without ID)
   * @returns A new Pattern with the note added
   */
  static addNote(pattern: Pattern, noteData: Omit<MIDINote, 'id'>): Pattern {
    if (!pattern || !noteData) {
      console.error("Invalid arguments to addNote");
      return pattern;
    }
    
    // Validate note data
    const validatedNoteData = this.validateNoteData(noteData);
    
    try {
      const newNote: MIDINote = {
        id: uuidv4(),
        ...validatedNoteData
      };

      // Calculate new pattern length if this note extends beyond current end
      const noteEnd = validatedNoteData.startTime + validatedNoteData.duration;
      const newLength = Math.max(pattern.length, noteEnd);

      return {
        ...pattern,
        notes: [...pattern.notes, newNote],
        length: newLength
      };
    } catch (error) {
      console.error("Error adding note:", error);
      return pattern;
    }
  }

  /**
   * Updates properties of an existing note
   * 
   * @param pattern - The source pattern
   * @param noteId - ID of the note to update
   * @param changes - Properties to update on the note
   * @returns A new Pattern with the note updated
   */
  static updateNote(pattern: Pattern, noteId: string, changes: Partial<Omit<MIDINote, 'id'>>): Pattern {
    if (!pattern || !noteId) {
      console.error("Invalid arguments to updateNote");
      return pattern;
    }
    
    try {
      // Find the note first to ensure it exists
      const noteToUpdate = pattern.notes.find(note => note.id === noteId);
      if (!noteToUpdate) {
        console.warn(`Note with ID ${noteId} not found`);
        return pattern;
      }
      
      // Validate the changes
      const validatedChanges = this.validateNoteData({
        ...noteToUpdate,
        ...changes
      });
      
      // Create updated notes array
      const updatedNotes = pattern.notes.map(note => {
        if (note.id === noteId) {
          return { ...note, ...validatedChanges };
        }
        return note;
      });

      // Recalculate pattern length if needed
      let maxLength = 0;
      updatedNotes.forEach(note => {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > maxLength) {
          maxLength = noteEnd;
        }
      });

      return {
        ...pattern,
        notes: updatedNotes,
        length: maxLength
      };
    } catch (error) {
      console.error("Error updating note:", error);
      return pattern;
    }
  }

  /**
   * Removes a note from the pattern
   * 
   * @param pattern - The source pattern
   * @param noteId - ID of the note to remove
   * @returns A new Pattern with the note removed
   */
  static removeNote(pattern: Pattern, noteId: string): Pattern {
    if (!pattern || !noteId) {
      console.error("Invalid arguments to removeNote");
      return pattern;
    }
    
    try {
      // Filter out the note to remove
      const updatedNotes = pattern.notes.filter(note => note.id !== noteId);
      
      // If no notes were removed, return the original pattern
      if (updatedNotes.length === pattern.notes.length) {
        console.warn(`Note with ID ${noteId} not found`);
        return pattern;
      }
      
      // Recalculate pattern length
      let maxLength = 0;
      updatedNotes.forEach(note => {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > maxLength) {
          maxLength = noteEnd;
        }
      });
      
      // Ensure minimum length is maintained (1 measure)
      const minimumLength = pattern.timeSignature[0] * pattern.ticksPerBeat;
      maxLength = Math.max(maxLength, minimumLength);

      return {
        ...pattern,
        notes: updatedNotes,
        length: maxLength
      };
    } catch (error) {
      console.error("Error removing note:", error);
      return pattern;
    }
  }

  /**
   * Updates note selection state
   * 
   * @param pattern - The source pattern
   * @param noteIds - IDs of notes to select
   * @returns A new Pattern with updated selection state
   */
  static selectNotes(pattern: Pattern, noteIds: string[]): Pattern {
    if (!pattern || !noteIds) {
      console.error("Invalid arguments to selectNotes");
      return pattern;
    }
    
    try {
      // Create a lookup set for faster checks
      const selectionSet = new Set(noteIds);
      
      const updatedNotes = pattern.notes.map(note => ({
        ...note,
        selected: selectionSet.has(note.id)
      }));

      return {
        ...pattern,
        notes: updatedNotes
      };
    } catch (error) {
      console.error("Error selecting notes:", error);
      return pattern;
    }
  }

  /**
   * Clears selection state from all notes
   * 
   * @param pattern - The source pattern
   * @returns A new Pattern with no selected notes
   */
  static clearSelection(pattern: Pattern): Pattern {
    if (!pattern) {
      console.error("Invalid pattern provided to clearSelection");
      return pattern;
    }
    
    try {
      const updatedNotes = pattern.notes.map(note => ({
        ...note,
        selected: false
      }));

      return {
        ...pattern,
        notes: updatedNotes
      };
    } catch (error) {
      console.error("Error clearing selection:", error);
      return pattern;
    }
  }

  /**
   * Returns all selected notes in the pattern
   * 
   * @param pattern - The source pattern
   * @returns Array of selected MIDINote objects
   */
  static getSelectedNotes(pattern: Pattern): MIDINote[] {
    if (!pattern) {
      console.error("Invalid pattern provided to getSelectedNotes");
      return [];
    }
    
    try {
      return pattern.notes.filter(note => note.selected);
    } catch (error) {
      console.error("Error getting selected notes:", error);
      return [];
    }
  }

  /**
   * Duplicates selected notes
   * 
   * This is a good candidate for WebAssembly optimization when handling
   * large numbers of notes.
   * 
   * @param pattern - The source pattern
   * @param offsetTicks - Optional offset in ticks for the duplicated notes
   * @returns A new Pattern with duplicated notes
   */
  static duplicateSelectedNotes(pattern: Pattern, offsetTicks: number = 0): Pattern {
    if (!pattern) {
      console.error("Invalid pattern provided to duplicateSelectedNotes");
      return pattern;
    }
    
    try {
      const selectedNotes = this.getSelectedNotes(pattern);
      if (selectedNotes.length === 0) return pattern;

      const newNotes = [...pattern.notes];
      
      // Create duplicates with new IDs and offset
      selectedNotes.forEach(selectedNote => {
        try {
          const newNote: MIDINote = {
            ...selectedNote,
            id: uuidv4(),
            selected: false,
            startTime: selectedNote.startTime + offsetTicks
          };
          newNotes.push(newNote);
        } catch (error) {
          console.error("Error duplicating individual note:", error);
        }
      });

      // Recalculate pattern length
      let maxLength = pattern.length;
      newNotes.forEach(note => {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > maxLength) {
          maxLength = noteEnd;
        }
      });

      return {
        ...pattern,
        notes: newNotes,
        length: maxLength
      };
    } catch (error) {
      console.error("Error duplicating notes:", error);
      return pattern;
    }
  }

  /**
   * Quantizes notes to the nearest grid position
   * 
   * This is a prime candidate for WebAssembly optimization as it involves
   * mathematical operations that can benefit from lower-level optimization.
   * 
   * @param pattern - The source pattern
   * @param noteIds - IDs of notes to quantize
   * @param gridSize - Grid size in ticks
   * @param quantizeStart - Whether to quantize note start times
   * @param quantizeDuration - Whether to quantize note durations
   * @param strength - Quantization strength (0.0-1.0)
   * @returns A new Pattern with quantized notes
   */
  static quantizeNotes(
    pattern: Pattern, 
    noteIds: string[], 
    gridSize: number, 
    quantizeStart: boolean = true, 
    quantizeDuration: boolean = false,
    strength: number = 1.0
  ): Pattern {
    if (!pattern || !noteIds || gridSize <= 0) {
      console.error("Invalid arguments to quantizeNotes");
      return pattern;
    }
    
    // Validate strength parameter
    const validStrength = Math.max(0, Math.min(1, strength));
    
    try {
      // Create a lookup set for faster checks
      const idSet = new Set(noteIds);
      
      const updatedNotes = pattern.notes.map(note => {
        if (!idSet.has(note.id)) return note;
        
        let updatedNote = { ...note };
        
        if (quantizeStart) {
          // Use forward quantization (move to the next grid point)
          const gridIndex = Math.floor(note.startTime / gridSize);
          const nextGridPoint = (gridIndex + 1) * gridSize;
          const distance = nextGridPoint - note.startTime;
          
          if (validStrength === 1.0) {
            // For full quantization, snap directly to next grid point
            updatedNote.startTime = nextGridPoint;
          } else {
            // For partial quantization, move exactly validStrength of the way toward next grid
            const movement = distance * validStrength;
            
            // Debug logs (uncomment for debugging)
            /*
            console.log('Quantization debug:', {
              originalStartTime: note.startTime,
              gridIndex,
              nextGridPoint,
              distance,
              strength: validStrength,
              movement,
              calculatedPosition: note.startTime + movement
            });
            */
            
            updatedNote.startTime = Math.max(0, Math.round(note.startTime + movement));
          }
        }
        
        if (quantizeDuration) {
          const nearestGridDuration = Math.max(gridSize, Math.round(note.duration / gridSize) * gridSize);
          const durationDiff = nearestGridDuration - note.duration;
          
          if (validStrength === 1.0) {
            // For full quantization, snap directly to grid
            updatedNote.duration = nearestGridDuration;
          } else {
            // For partial quantization
            const weightedDiff = durationDiff * validStrength;
            updatedNote.duration = Math.max(gridSize, Math.floor(note.duration + weightedDiff));
          }
        }
        
        return updatedNote;
      });
      
      return {
        ...pattern,
        notes: updatedNotes
      };
    } catch (error) {
      console.error("Error quantizing notes:", error);
      return pattern;
    }
  }

  /**
   * Transposes selected notes by the given number of semitones
   * 
   * @param pattern - The source pattern
   * @param noteIds - IDs of notes to transpose
   * @param semitones - Number of semitones to transpose (positive or negative)
   * @returns A new Pattern with transposed notes
   */
  static transposeNotes(pattern: Pattern, noteIds: string[], semitones: number): Pattern {
    if (!pattern || !noteIds) {
      console.error("Invalid arguments to transposeNotes");
      return pattern;
    }
    
    if (semitones === 0) return pattern;
    
    try {
      // Create a lookup set for faster checks
      const idSet = new Set(noteIds);
      
      const updatedNotes = pattern.notes.map(note => {
        if (!idSet.has(note.id)) return note;
        
        // Calculate new pitch within MIDI range (0-127)
        const newPitch = Math.min(127, Math.max(0, note.pitch + semitones));
        
        return {
          ...note,
          pitch: newPitch
        };
      });
      
      return {
        ...pattern,
        notes: updatedNotes
      };
    } catch (error) {
      console.error("Error transposing notes:", error);
      return pattern;
    }
  }

  /**
   * Sets the velocity of selected notes
   * 
   * @param pattern - The source pattern
   * @param noteIds - IDs of notes to modify
   * @param velocity - New velocity value (1-127)
   * @returns A new Pattern with updated note velocities
   */
  static setNotesVelocity(pattern: Pattern, noteIds: string[], velocity: number): Pattern {
    if (!pattern || !noteIds) {
      console.error("Invalid arguments to setNotesVelocity");
      return pattern;
    }
    
    try {
      // Clamp velocity to MIDI range
      const clampedVelocity = Math.min(127, Math.max(1, velocity));
      
      // Create a lookup set for faster checks
      const idSet = new Set(noteIds);
      
      const updatedNotes = pattern.notes.map(note => {
        if (!idSet.has(note.id)) return note;
        
        return {
          ...note,
          velocity: clampedVelocity
        };
      });
      
      return {
        ...pattern,
        notes: updatedNotes
      };
    } catch (error) {
      console.error("Error setting note velocities:", error);
      return pattern;
    }
  }

  /**
   * Scales the velocity of selected notes by a percentage
   * 
   * @param pattern - The source pattern
   * @param noteIds - IDs of notes to modify
   * @param percentage - Percentage to scale velocity (e.g., 50 = half, 200 = double)
   * @returns A new Pattern with scaled note velocities
   */
  static scaleNotesVelocity(pattern: Pattern, noteIds: string[], percentage: number): Pattern {
    if (!pattern || !noteIds) {
      console.error("Invalid arguments to scaleNotesVelocity");
      return pattern;
    }
    
    try {
      // Create a lookup set for faster checks
      const idSet = new Set(noteIds);
      
      const updatedNotes = pattern.notes.map(note => {
        if (!idSet.has(note.id)) return note;
        
        const newVelocity = Math.min(127, Math.max(1, Math.round(note.velocity * (percentage / 100))));
        
        return {
          ...note,
          velocity: newVelocity
        };
      });
      
      return {
        ...pattern,
        notes: updatedNotes
      };
    } catch (error) {
      console.error("Error scaling note velocities:", error);
      return pattern;
    }
  }

  /**
   * Gets all notes within a specific time range
   * 
   * This is a key method that could benefit from WebAssembly optimization
   * as it involves range checks that are frequently performed during rendering
   * and editing operations.
   * 
   * Future optimization could include spatial indexing data structures.
   * 
   * @param pattern - The source pattern
   * @param startTime - Range start in ticks
   * @param endTime - Range end in ticks
   * @returns Array of notes that overlap with the specified time range
   */
  static getNotesInTimeRange(pattern: Pattern, startTime: number, endTime: number): MIDINote[] {
    if (!pattern || startTime >= endTime) {
      return [];
    }
    
    try {
      // Future optimization opportunity:
      // Implement spatial index for O(log n + k) instead of O(n) performance
      // where k is the number of notes in the range
      return pattern.notes.filter(note => {
        const noteEnd = note.startTime + note.duration;
        
        // Note overlaps with the time range if:
        // - Note starts within the range, OR
        // - Note ends within the range, OR
        // - Note starts before and ends after the range (encompasses it)
        return (note.startTime >= startTime && note.startTime < endTime) ||  // Note starts in range
               (noteEnd > startTime && noteEnd <= endTime) ||                // Note ends in range
               (note.startTime <= startTime && noteEnd >= endTime);          // Note encompasses range
      });
    } catch (error) {
      console.error("Error getting notes in time range:", error);
      return [];
    }
  }

  /**
   * Converts tick position to beat position
   * 
   * @param pattern - The source pattern
   * @param ticks - Position in ticks
   * @returns Equivalent position in beats
   */
  static ticksToBeat(pattern: Pattern, ticks: number): number {
    if (!pattern || !pattern.ticksPerBeat || pattern.ticksPerBeat <= 0) {
      console.error("Invalid pattern or ticksPerBeat for ticksToBeat conversion");
      return 0;
    }
    
    return ticks / pattern.ticksPerBeat;
  }

  /**
   * Converts beat position to tick position
   * 
   * @param pattern - The source pattern
   * @param beat - Position in beats
   * @returns Equivalent position in ticks (rounded to nearest tick)
   */
  static beatToTicks(pattern: Pattern, beat: number): number {
    if (!pattern || !pattern.ticksPerBeat || pattern.ticksPerBeat <= 0) {
      console.error("Invalid pattern or ticksPerBeat for beatToTicks conversion");
      return 0;
    }
    
    return Math.round(beat * pattern.ticksPerBeat);
  }
  
  /**
   * Private helper to validate and sanitize note data
   * 
   * @param noteData - The note data to validate
   * @returns Validated and sanitized note data
   */
  private static validateNoteData(noteData: Partial<MIDINote>): Omit<MIDINote, 'id'> {
    // Ensure all required fields have valid values
    const pitch = Math.min(127, Math.max(0, noteData.pitch ?? 60));
    const startTime = Math.max(0, noteData.startTime ?? 0);
    const duration = Math.max(1, noteData.duration ?? 480);
    const velocity = Math.min(127, Math.max(1, noteData.velocity ?? 100));
    
    return {
      pitch,
      startTime,
      duration,
      velocity,
      selected: noteData.selected ?? false
    };
  }
}