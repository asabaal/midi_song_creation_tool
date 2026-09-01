import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as chordProgressionService from '../../services/chordProgressionService';

/**
 * Export Controls Component
 * 
 * Provides export functionality for chord progressions including
 * MIDI file export and progression data export.
 */
const ExportControls = ({ progression, selectedKey, tempo }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('midi');
  const [includeAnalysis, setIncludeAnalysis] = useState(true);

  // Handle MIDI export
  const handleMidiExport = async () => {
    if (progression.length === 0) {
      alert('No chords to export. Add some chords to the progression first.');
      return;
    }

    setIsExporting(true);
    try {
      // Generate progression data
      const progressionData = await chordProgressionService.generateProgression(
        selectedKey,
        progression.map(chord => ({
          name: chord.name,
          duration: chord.duration,
          custom: chord.isCustom,
          notes: chord.isCustom ? chord.notes : undefined
        })),
        tempo
      );

      // Export to MIDI
      const midiData = await chordProgressionService.exportProgression(
        progressionData.progression,
        'midi'
      );

      // Download the file
      await chordProgressionService.downloadMidiFile(midiData);

      // Show success message
      alert(`MIDI file "${midiData.filename}" downloaded successfully!`);
    } catch (error) {
      console.error('Error exporting MIDI:', error);
      alert('Failed to export MIDI file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle JSON export
  const handleJsonExport = () => {
    if (progression.length === 0) {
      alert('No chords to export. Add some chords to the progression first.');
      return;
    }

    try {
      const exportData = {
        metadata: {
          key: selectedKey,
          tempo: tempo,
          timeSignature: [4, 4],
          exportDate: new Date().toISOString(),
          version: '1.0'
        },
        progression: progression.map((chord, index) => ({
          id: chord.id,
          position: index,
          name: chord.name,
          root: chord.root,
          type: chord.type,
          duration: chord.duration,
          durationInBeats: chord.durationInBeats,
          startTime: chord.startTime,
          notes: chord.notes,
          midiNotes: chord.midiNotes,
          isCustom: chord.isCustom,
          function: chord.function
        }))
      };

      // Add analysis if requested
      if (includeAnalysis) {
        const duration = chordProgressionService.calculateProgressionDuration(progression, tempo);
        exportData.analysis = {
          totalChords: progression.length,
          totalBeats: duration.totalBeats,
          totalSeconds: duration.totalSeconds,
          formattedDuration: duration.formattedTime,
          customChords: progression.filter(chord => chord.isCustom).length,
          chordTypes: [...new Set(progression.map(chord => chord.type))],
          averageChordDuration: duration.totalBeats / progression.length
        };
      }

      // Create and download JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `chord-progression-${selectedKey.replace(' ', '-')}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Progression data exported successfully!');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export progression data. Please try again.');
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (progression.length === 0) {
      alert('No chords to copy. Add some chords to the progression first.');
      return;
    }

    try {
      const progressionText = progression.map(chord => 
        `${chord.name} (${chord.duration})`
      ).join(' → ');

      await navigator.clipboard.writeText(progressionText);
      alert('Progression copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  // Generate shareable link (placeholder for future implementation)
  const handleShareLink = () => {
    if (progression.length === 0) {
      alert('No chords to share. Add some chords to the progression first.');
      return;
    }

    // This would be implemented with a backend service to store and share progressions
    alert('Share functionality coming soon! For now, you can export the progression as JSON or MIDI.');
  };

  const canExport = progression.length > 0 && !isExporting;

  return (
    <div className="export-controls">
      <div className="section-header">
        <h3 className="section-title">Export Controls</h3>
      </div>

      {progression.length === 0 ? (
        <div className="no-progression">
          <p>Add chords to the progression to enable export options</p>
        </div>
      ) : (
        <div className="export-content">
          {/* Export Options */}
          <div className="export-options">
            <div className="format-selector">
              <label className="control-label">Export Format:</label>
              <div className="format-options">
                <button
                  onClick={() => setExportFormat('midi')}
                  className={`format-option ${exportFormat === 'midi' ? 'active' : ''}`}
                >
                  <div className="format-icon">🎵</div>
                  <div className="format-name">MIDI File</div>
                  <div className="format-description">
                    Standard MIDI file for use in DAWs and music software
                  </div>
                </button>
                
                <button
                  onClick={() => setExportFormat('json')}
                  className={`format-option ${exportFormat === 'json' ? 'active' : ''}`}
                >
                  <div className="format-icon">📄</div>
                  <div className="format-name">JSON Data</div>
                  <div className="format-description">
                    Complete progression data for backup and analysis
                  </div>
                </button>
              </div>
            </div>

            {/* JSON Options */}
            {exportFormat === 'json' && (
              <div className="json-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeAnalysis}
                    onChange={(e) => setIncludeAnalysis(e.target.checked)}
                    className="checkbox"
                  />
                  <span className="checkmark"></span>
                  Include analysis and statistics
                </label>
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="export-actions">
            {exportFormat === 'midi' ? (
              <button
                onClick={handleMidiExport}
                disabled={!canExport}
                className="btn btn-primary btn-large"
              >
                {isExporting ? (
                  <>
                    <div className="loading-small"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    📥 Download MIDI File
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleJsonExport}
                disabled={!canExport}
                className="btn btn-primary btn-large"
              >
                📄 Download JSON
              </button>
            )}

            <div className="secondary-actions">
              <button
                onClick={handleCopyToClipboard}
                disabled={!canExport}
                className="btn btn-secondary"
                title="Copy progression as text"
              >
                📋 Copy to Clipboard
              </button>
              
              <button
                onClick={handleShareLink}
                disabled={!canExport}
                className="btn btn-secondary"
                title="Create shareable link"
              >
                🔗 Share Progression
              </button>
            </div>
          </div>

          {/* Export Preview */}
          <div className="export-preview">
            <h4>Export Preview</h4>
            <div className="preview-content">
              <div className="preview-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Key:</span>
                  <span className="metadata-value">{selectedKey}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Tempo:</span>
                  <span className="metadata-value">{tempo} BPM</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Chords:</span>
                  <span className="metadata-value">{progression.length}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Duration:</span>
                  <span className="metadata-value">
                    {chordProgressionService.calculateProgressionDuration(progression, tempo).formattedTime}
                  </span>
                </div>
              </div>
              
              <div className="preview-progression">
                <span className="preview-label">Progression:</span>
                <div className="preview-chords">
                  {progression.map((chord, index) => (
                    <span key={chord.id} className="preview-chord">
                      {chord.name}
                      {index < progression.length - 1 && ' → '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Information */}
          <div className="export-info">
            <details>
              <summary className="info-toggle">Export Information</summary>
              <div className="info-content">
                <div className="info-section">
                  <h5>MIDI Export</h5>
                  <ul>
                    <li>Compatible with all major DAWs (Ableton, Logic, FL Studio, etc.)</li>
                    <li>Preserves exact timing and chord voicings</li>
                    <li>Uses piano sound (Program 1) by default</li>
                    <li>File size: Typically 1-5KB per progression</li>
                  </ul>
                </div>
                
                <div className="info-section">
                  <h5>JSON Export</h5>
                  <ul>
                    <li>Human-readable format for backup and analysis</li>
                    <li>Contains complete chord information and metadata</li>
                    <li>Can be imported back into the tool</li>
                    <li>Useful for custom processing and integration</li>
                  </ul>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

ExportControls.propTypes = {
  progression: PropTypes.array.isRequired,
  selectedKey: PropTypes.string.isRequired,
  tempo: PropTypes.number.isRequired
};

export default ExportControls;