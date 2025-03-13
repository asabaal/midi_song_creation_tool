#!/bin/bash

echo "Removing duplicate mock files..."

# Run music theory tests
echo -e "\n=== Running Music Theory Edge Cases Tests ===\n"
npx jest tests/integration/api/musicTheoryEdgeCases.test.js --colors

# Run UI tests
echo -e "\n=== Running UI State Management Tests ===\n"
npx jest tests/unit/client/components/PianoRollState.test.jsx tests/unit/client/components/TransportControlsState.test.jsx --colors

echo -e "\nTests completed!"
echo -e "\nTo see filtered results of all tests, run:"
echo -e "  bash check-tests.sh"
echo -e "  bash filter-test-results.sh"
