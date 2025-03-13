#!/bin/bash

# Run all tests with our fixes

# Make sure we have dependencies installed
echo "Ensuring dependencies are installed..."
npm install identity-obj-proxy jest-canvas-mock --save-dev

# Run the music theory tests first since they're the most important
echo -e "\n=== Running Music Theory Edge Cases Tests ===\n"
npx jest tests/integration/api/musicTheoryEdgeCases.test.js

# Run the UI component tests
echo -e "\n=== Running UI Component Tests ===\n"
npx jest tests/unit/client/components/TransportControlsState.test.jsx tests/unit/client/components/PianoRollState.test.jsx

# Run all tests
echo -e "\n=== Running All Tests ===\n"
npx jest

# Generate a comprehensive test report
echo -e "\n=== Test Summary ===\n"
npx jest --json > test-report.json
echo "Passed tests: $(grep -c "\"status\":\"passed\"" test-report.json)"
echo "Failed tests: $(grep -c "\"status\":\"failed\"" test-report.json)"

echo -e "\nTest report has been saved to test-report.json"
echo -e "To see filtered results of all tests, run:"
echo -e "  bash check-tests.sh"
echo -e "  bash filter-test-results.sh"
