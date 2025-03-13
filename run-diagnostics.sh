#!/bin/bash

# Script to run tests with diagnostics enabled

# Add diagnostic script to Jest setup
if [ -f jest.setup.js ]; then
  # Create a backup
  cp jest.setup.js jest.setup.js.bak
  
  # Add diagnostic require if it's not already there
  if ! grep -q "require('./test-diagnostics')" jest.setup.js; then
    echo -e "\n// Add test diagnostics\nrequire('./test-diagnostics');" >> jest.setup.js
    echo "Added diagnostics to Jest setup"
  else
    echo "Diagnostics already in Jest setup"
  fi
else
  echo "Warning: jest.setup.js not found, creating it"
  echo "// Jest setup with diagnostics\nrequire('./test-diagnostics');" > jest.setup.js
fi

# Create the diagnostics output directory
mkdir -p test-diagnostics

# Run specific tests for the PianoRoll component with detailed logging
echo "Running tests with diagnostics and saving detailed output..."
npx jest "PianoRoll" --no-colors > test-diagnostics/pianoroll-tests.log 2>&1

echo "Checking where the PianoRoll tests are defined..."
grep -n "\[DIAGNOSTIC\] Test suite defined: \"PianoRoll" test-diagnostics/pianoroll-tests.log

echo "Checking import paths for PianoRoll component..."
grep -n "\[DIAGNOSTIC\] Require called for:" test-diagnostics/pianoroll-tests.log | grep -i piano

echo "Checking component rendering attempts..."
grep -n "\[DIAGNOSTIC\] Rendering component:" test-diagnostics/pianoroll-tests.log

echo "Checking for specific error details..."
grep -n "\[DIAGNOSTIC\] Component render error details:" test-diagnostics/pianoroll-tests.log -A 10

echo "Complete diagnostics output saved to test-diagnostics/pianoroll-tests.log"
echo "Examine this file for detailed information about the failing tests"
