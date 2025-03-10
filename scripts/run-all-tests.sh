#!/bin/bash
# Run all component tests

echo "🎵 MIDI Song Creation Tool - Component Tests 🎵"
echo "============================================="

# Run all component tests
npx jest tests/unit/client/components --verbose

echo "============================================="
echo "All component tests completed!"
