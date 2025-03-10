#!/bin/bash
# Script to test the PianoRoll component specifically

echo "🎹 Testing PianoRoll Component 🎹"
echo "====================================="

# Run just the PianoRoll test
npx jest tests/unit/client/components/PianoRoll.test.jsx --verbose

echo "Done!"
