#!/bin/bash

# This script runs only the newly added tests

# Clean up any duplicate mocks first
echo "Removing duplicate mock files..."
rm -rf tests/__mocks__

# Run music theory edge cases tests
echo "\n=== Running Music Theory Edge Cases Tests ===\n"
npx jest tests/integration/api/musicTheoryEdgeCases.test.js

# Check if React Testing Library is installed
if ! npm list @testing-library/react | grep -q "@testing-library/react"; then
  echo "\n@testing-library/react is not installed. Skipping UI state tests.\n"
  echo "To run UI state tests, install the required packages:\n"
  echo "npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event"
else
  # Run UI state management tests
  echo "\n=== Running UI State Management Tests ===\n"
  npx jest tests/unit/client/components/PianoRollState.test.jsx tests/unit/client/components/TransportControlsState.test.jsx
fi

echo "\nTests completed!"
