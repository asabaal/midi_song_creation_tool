# Project Structure Reorganization

This PR focuses solely on reorganizing the project structure for better maintainability.

## Changes
- Restructured project from flat structure to src/client, src/server, src/core
- Moved components into appropriate directories
- Updated imports and dependencies for new structure
- No functional changes to components
- No changes to testing or linting configuration

## How to Test
- Run the application locally to ensure it functions the same as before
- Verify all existing features work as expected

## Implementation Notes

This is the first of three PRs to restructure the project:
1. Project Structure (this PR)
2. Testing Infrastructure (coming next)
3. Linting Configuration (final PR)

By separating these concerns, we make it easier to review and understand each change.
