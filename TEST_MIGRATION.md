# Test Migration Guide

This document outlines how to adapt the test suite when moving from the `develop` branch structure to the new structure in the `feature/project-structure` branch.

## Overview of Changes

The `feature/project-structure` branch introduces the following major structural changes:

1. Code is organized in a new src directory structure (src/core, src/server, src/client)
2. API routes are split into separate files (sessionRoutes.js, musicTheoryRoutes.js, patternRoutes.js, exportRoutes.js)
3. Models are separated and use a proper MongoDB/Mongoose schema
4. The web application interface has been improved and reorganized

## Test Modification Checklist

When migrating the test suite to work with the new project structure, follow these steps:

### 1. Update Import Paths

Update import paths in all test files to reflect the new structure:

| Old Path | New Path |
|----------|----------|
| `require('./midi-framework.js')` | `require('../src/core/midi-framework.js')` |
| `require('./midi-api.js')` | `require('../src/server/app.js')` |
| `require('./midi-exporter.js')` | `require('../src/core/midiExport.js')` |
| `require('./fixed-patterns.js')` | `require('../src/core/patternGenerator.js')` |

### 2. Update API Endpoint Paths

The API routes have been restructured and endpoints moved to different files:

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `/api/sessions/:sessionId/patterns/chord-progression` | `/api/patterns/chord-progression` |
| `/api/sessions/:sessionId/patterns/bassline` | `/api/patterns/bassline` |
| `/api/sessions/:sessionId/patterns/drums` | `/api/patterns/drums` |
| `/api/sessions/:sessionId/notes` | `/api/patterns/notes/:sessionId/:trackId` |
| `/api/sessions/:sessionId/export/midi` | `/api/export/midi/:sessionId` |
| `/api/sessions/:sessionId/export/json` | `/api/export/json/:sessionId` |
| `/api/sessions/:sessionId/import` | `/api/export/import` |

### 3. Update Mock Objects

Mocks need to be updated to match the new model structure:

- The Session model now uses a MongoDB schema with tracks and notes
- Update SessionContextMock.js to match the new structure
- Note objects now include additional properties like instrument and channel

### 4. Cypress Test Updates

Cypress selectors and URL patterns need to be updated:

- Update selectors to match the new UI structure
- Update network interception paths to the new API routes
- Update assertions to match the new UI behavior

### 5. Files Requiring Updates

The following test files need path or import updates:

#### Unit Tests
- tests/unit/core/midi-framework.test.js
- tests/unit/core/midiSequence.test.js
- tests/unit/core/musicTheory.test.js
- tests/unit/core/patternGenerator.test.js
- tests/unit/core/midiExport.test.js

#### Integration Tests
- tests/integration/api/musicTheoryApi.test.js
- tests/integration/api/sequenceApi.test.js
- tests/integration/api/sessionApi.test.js
- tests/integration/api/sessionManagement.test.js
- tests/integration/api/patternRoutes.test.js
- tests/integration/api/exportRoutes.test.js

#### End-to-End Tests
- tests/e2e/cypress/specs/create-session.cy.js
- tests/e2e/cypress/specs/pattern-generation.cy.js
- tests/e2e/cypress/specs/file-import-export.cy.js
- tests/e2e/cypress/specs/full-song-workflow.cy.js
- tests/e2e/cypress/specs/web-interface.cy.js

### 6. Model Structure Changes

Key model structure changes to account for in tests:

1. **Session Model:**
   - Now has a MongoDB schema
   - Contains tracks array instead of sequences
   - Each track contains notes and instrument information

2. **Notes Format:**
   - Notes now have additional properties (instrument, channel)
   - Timing and duration conventions remain the same

3. **API Response Formats:**
   - API responses include MongoDB IDs
   - Success/error formats are consistent across endpoints

## Implementation Strategy

The recommended approach for implementing these changes:

1. First, merge the `feature/project-structure` branch
2. Then, apply the changes outlined in this guide to update test paths
3. Create a dedicated PR for test path updates only
4. Run the test suite and fix any remaining issues

By following this migration guide, the test suite can be successfully adapted to work with the new project structure while maintaining comprehensive test coverage.
