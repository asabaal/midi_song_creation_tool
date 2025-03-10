#!/bin/bash
# Script to fix all ESLint issues in one go

# Make script execute from project root regardless of where it's called from
cd "$(dirname "$0")/.." || exit

echo "🔧 Fixing ESLint issues..."

# 1. Run special whitespace fix for midiSequence.js line 208
node scripts/fix_specific_line.js

# 2. Fix all prettier issues with ESLint's --fix option
npx eslint --fix src/core/midiExport.js src/core/musicTheory.js src/core/midiSequence.js

# 3. Fallback to Prettier
npx prettier --write src/core/midiExport.js src/core/musicTheory.js src/core/midiSequence.js

# 4. Fix any remaining whitespace issues
node scripts/fix_whitespace.js

echo "✅ Fixed all ESLint issues. Run ./scripts/local_test.sh to verify."
