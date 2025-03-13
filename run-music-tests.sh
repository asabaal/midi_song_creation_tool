#!/bin/bash

# Run just the music theory tests to verify our fixes

# Ensure we have the dependencies
echo "Installing test dependencies..."
npm install identity-obj-proxy jest-canvas-mock --save-dev

# Run the tests
echo -e "\n=== Running Music Theory Edge Cases Tests ===\n"
npx jest tests/integration/api/musicTheoryEdgeCases.test.js --verbose

echo -e "\n=== Test complete! ===\n"
