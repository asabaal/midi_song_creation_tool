#!/bin/bash

# First, install the identity-obj-proxy dependency
echo "Installing dependencies..."
npm install identity-obj-proxy --save-dev

# Run the specific failing tests
echo -e "\n=== Running Fixed Music Theory Edge Cases Tests ===\n"
npx jest tests/integration/api/musicTheoryEdgeCases.test.js --colors

echo -e "\n=== Running Fixed UI Component Tests ===\n"
npx jest tests/unit/client/components/PianoRollState.test.jsx tests/unit/client/components/TransportControlsState.test.jsx --colors

echo -e "\nTests completed! Use check-tests.sh and filter-test-results.sh to see filtered results."
