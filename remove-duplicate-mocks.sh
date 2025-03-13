#!/bin/bash

# Remove the duplicate mock files
rm -f tests/__mocks__/fileMock.js
rm -f tests/__mocks__/styleMock.js

# Report successful removal
echo "Duplicate mock files removed successfully."
