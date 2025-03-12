#!/bin/bash

# This is a bash script to find and resolve duplicate mock files

# First, let's check if __mocks__ directory exists at root
if [ -d "__mocks__" ]; then
  echo "Found __mocks__ directory at root level"
  
  # Check if fileMock.js exists in both places
  if [ -f "__mocks__/fileMock.js" ] && [ -f "tests/__mocks__/fileMock.js" ]; then
    echo "Found duplicate fileMock.js files"
    echo "Removing __mocks__/fileMock.js (keeping the one in tests/__mocks__)"
    rm "__mocks__/fileMock.js"
  fi
  
  # Check if styleMock.js exists in both places
  if [ -f "__mocks__/styleMock.js" ] && [ -f "tests/__mocks__/styleMock.js" ]; then
    echo "Found duplicate styleMock.js files"
    echo "Removing __mocks__/styleMock.js (keeping the one in tests/__mocks__)"
    rm "__mocks__/styleMock.js"
  fi
else
  echo "No __mocks__ directory at root level"
fi

# Create tests/__mocks__ directory if it doesn't exist
mkdir -p "tests/__mocks__"
