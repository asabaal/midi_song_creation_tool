#!/bin/bash
# Local testing script for MIDI Song Creation Tool
# Run this script to verify that your code meets all quality standards before pushing

echo "🎵 MIDI Song Creation Tool - Local Testing 🎵"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Display Node and npm versions
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo "============================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci || { echo "❌ Failed to install dependencies"; exit 1; }
else
    echo "✅ Dependencies already installed"
fi

# Run linting
echo "🔍 Running ESLint..."
npx eslint . --ext .js,.jsx || { echo "❌ ESLint checks failed"; exit 1; }
echo "✅ ESLint passed"

echo "🔍 Running Prettier format check..."
npx prettier --check "**/*.{js,jsx,json,md}" || { echo "❌ Prettier checks failed"; exit 1; }
echo "✅ Prettier checks passed"

# Run tests
echo "🧪 Running unit tests..."
npm run test:unit || { echo "❌ Unit tests failed"; exit 1; }
echo "✅ Unit tests passed"

echo "🧪 Running integration tests..."
npm run test:integration || { echo "❌ Integration tests failed"; exit 1; }
echo "✅ Integration tests passed"

echo "🧪 Running E2E tests..."
npm run test:e2e || { echo "❌ E2E tests failed"; exit 1; }
echo "✅ E2E tests passed"

# Check test coverage
echo "📊 Checking test coverage..."
npm run test:coverage || { echo "❌ Coverage generation failed"; exit 1; }

# Verify coverage thresholds
echo "📊 Verifying coverage thresholds..."
COVERAGE_FILE="coverage/coverage-summary.json"
if [ -f "$COVERAGE_FILE" ]; then
    LINES_PCT=$(grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*' $COVERAGE_FILE | grep -o 'pct":[0-9.]*' | cut -d ':' -f2 | tr -d ',')
    FUNCTIONS_PCT=$(grep -o '"functions":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*' $COVERAGE_FILE | grep -o 'pct":[0-9.]*' | cut -d ':' -f2 | tr -d ',')
    
    echo "Lines coverage: $LINES_PCT%"
    echo "Functions coverage: $FUNCTIONS_PCT%"
    
    # Verify coverage thresholds
    if (( $(echo "$LINES_PCT < 70" | bc -l) )); then
        echo "❌ Lines coverage ($LINES_PCT%) is below the 70% threshold!"
        FAILURES=true
    fi
    
    if (( $(echo "$FUNCTIONS_PCT < 70" | bc -l) )); then
        echo "❌ Functions coverage ($FUNCTIONS_PCT%) is below the 70% threshold!"
        FAILURES=true
    fi
    
    if [ "$FAILURES" = true ]; then
        echo "❌ Coverage thresholds not met"
        exit 1
    else
        echo "✅ Coverage thresholds met"
    fi
else
    echo "❌ Coverage file not found"
    exit 1
fi

# Build the project
echo "🏗️ Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }
echo "✅ Build succeeded"

# All tests passed
echo "============================================="
echo "🎉 All local tests passed! Your code is ready to be pushed."
echo "To run the project locally for manual testing, use 'npm start'"
echo "============================================="
