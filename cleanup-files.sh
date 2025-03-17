#!/bin/bash

# Remove duplicate API files
rm -f error-fix-api.js
rm -f ultimate-fix-api.js
rm -f complete-fix-api.js
rm -f fixed-midi-api.js

# Remove duplicate HTML files
rm -f public/index-fixed.html
rm -f public/super-simple.html

# Remove duplicate test files
rm -f api-test-simple.js
rm -f api-test-ultimate.js

echo "Cleaned up duplicate files!"
