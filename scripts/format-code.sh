#!/bin/bash
# Script to automatically format code with Prettier

echo "🔍 Running Prettier to format code..."

# Format core and server modules
npx prettier --write "src/core/**/*.js" "src/server/**/*.js"

echo "✅ Code formatting complete!"
