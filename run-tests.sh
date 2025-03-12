#!/bin/bash
# Script to run Jest tests with better configuration

# Run the Jest tests with warnings ignored
SUPPRESS_JEST_WARNINGS=true npx jest --config jest.config.js --no-watchman