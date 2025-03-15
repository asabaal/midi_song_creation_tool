#!/bin/bash
# Script to fix package.json syntax errors

echo "Restoring package.json from backup..."
if [ -f .backup/package.json ]; then
  cp .backup/package.json package.json
  echo "✓ Restored from backup"
else
  echo "! No backup found, creating a fresh package.json..."
  # This is a basic package.json template - adjust as needed
  cat > package.json << 'EOF'
{
  "name": "midi_song_creation_tool",
  "version": "1.0.0",
  "description": "A tool for creating MIDI songs",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,scss,md}\""
  },
  "devDependencies": {
    "cypress": "^13.3.0",
    "eslint": "^8.57.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.33.2",
    "prettier": "^3.2.5"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
EOF
  echo "✓ Created new package.json"
fi

echo "Successfully fixed package.json"
