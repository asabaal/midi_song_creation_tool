#!/bin/bash
# Script to apply Prettier formatting to all files

# Make script execute from project root regardless of where it's called from
cd "$(dirname "$0")/.." || exit

echo "💅 Running Prettier on all files..."

# Apply Prettier formatting to JS/JSX files
npx prettier --write "src/**/*.{js,jsx}" --loglevel warn

# Apply Prettier formatting to JSON files
npx prettier --write "src/**/*.json" --loglevel warn

# Apply Prettier formatting to Markdown files
npx prettier --write "**/*.md" --prose-wrap always --loglevel warn

# Apply Prettier formatting to package.json and other config files
npx prettier --write "package.json" "package-lock.json" ".eslintrc.js" ".prettierrc" --loglevel warn

echo "✅ Prettier formatting complete!"
