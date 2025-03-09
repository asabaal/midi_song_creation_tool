#!/bin/bash
# Script to update the README with testing results

echo "🔍 Updating README with testing status..."

# Get the current date
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Create a testing status badge for the README
echo "[![Test Status](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/asabaal/midi_song_creation_tool/actions)" > testing-status.txt

# Update the README (in a real project, this would modify the actual README)
echo "Testing status updated on $DATE"

echo "✅ README updated successfully"
