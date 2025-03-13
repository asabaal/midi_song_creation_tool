#!/bin/bash

# Script to add the import fix to Jest setup

# Add import fix to Jest setup
if [ -f jest.setup.js ]; then
  # Create a backup
  cp jest.setup.js jest.setup.js.bak
  
  # Add import fix if it's not already there
  if ! grep -q "require('./import-fix')" jest.setup.js; then
    echo -e "\n// Add direct import fix\nrequire('./import-fix');" >> jest.setup.js
    echo "Added import fix to Jest setup"
  else
    echo "Import fix already in Jest setup"
  fi
else
  echo "Warning: jest.setup.js not found, creating it"
  echo "// Jest setup with import fix\nrequire('./import-fix');" > jest.setup.js
fi

echo "Import fix applied. Run tests with: bash check-tests.sh && bash enhance-test-filter.sh"
