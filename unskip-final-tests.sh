#!/bin/bash

# Script to find and unskip the final remaining skipped tests

echo "Looking for skipped tests using verbose Jest output..."
# Run Jest with verbose output to identify skipped tests
npx jest --verbose > skipped-tests-verbose.log 2>&1

# Extract the names of skipped tests from verbose output
echo "Extracting skipped test names..."
SKIPPED_TESTS=$(grep -A 1 "skipped" skipped-tests-verbose.log | grep -v "skipped" | grep -v "\-\-" | sed 's/^[ \t]*//' | sort | uniq)

if [ -n "$SKIPPED_TESTS" ]; then
  echo "Found the following skipped tests:"
  echo "$SKIPPED_TESTS"
  
  # Find files containing these test names
  for test in $SKIPPED_TESTS; do
    echo "Looking for test: $test"
    FOUND_FILES=$(grep -r --include="*.js" --include="*.jsx" "$test" tests/)
    
    if [ -n "$FOUND_FILES" ]; then
      echo "Found in:"
      echo "$FOUND_FILES"
      
      # For each file containing the test name
      echo "$FOUND_FILES" | while IFS=':' read -r file rest; do
        echo "Checking $file for skipped tests..."
        
        # Look for exactly this test being skipped
        if grep -q "test\.skip(.*$test" "$file" || grep -q "it\.skip(.*$test" "$file"; then
          echo "Found skipped test in $file, unskipping..."
          sed -i "s/test\.skip(\(.*\)$test/test(\1$test/g" "$file"
          sed -i "s/it\.skip(\(.*\)$test/it(\1$test/g" "$file"
        fi
      done
    else
      echo "Test not found in source files."
    fi
  done
else
  echo "No skipped test names found in verbose output."
fi

# Also do a general search for any remaining skipped tests
echo "Searching for any remaining test.skip or it.skip patterns..."
SKIPPED_PATTERNS=$(grep -r --include="*.js" --include="*.jsx" -E "(test|it)\.skip\(" tests/)

if [ -n "$SKIPPED_PATTERNS" ]; then
  echo "Found skipped test patterns:"
  echo "$SKIPPED_PATTERNS"
  
  # Convert all test.skip to test and it.skip to it
  find tests/ -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/test\.skip(/test(/g' {} \;
  find tests/ -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/it\.skip(/it(/g' {} \;
  
  echo "Converted all skipped tests to regular tests"
else
  echo "No skipped test patterns found."
fi

# Also search for describe.skip
echo "Searching for any skipped test suites (describe.skip)..."
SKIPPED_SUITES=$(grep -r --include="*.js" --include="*.jsx" "describe\.skip" tests/)

if [ -n "$SKIPPED_SUITES" ]; then
  echo "Found skipped test suites:"
  echo "$SKIPPED_SUITES"
  
  # Convert all describe.skip to describe
  find tests/ -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/describe\.skip/describe/g' {} \;
  
  echo "Converted all skipped test suites to regular test suites"
else
  echo "No skipped test suites found."
fi

# Look for xtest, xit, xdescribe (alternative way to skip tests)
echo "Searching for xtest, xit, xdescribe patterns..."
SKIPPED_X_PATTERNS=$(grep -r --include="*.js" --include="*.jsx" -E "(xtest|xit|xdescribe)\(" tests/)

if [ -n "$SKIPPED_X_PATTERNS" ]; then
  echo "Found x-skipped test patterns:"
  echo "$SKIPPED_X_PATTERNS"
  
  # Convert all xtest to test, xit to it, xdescribe to describe
  find tests/ -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/xtest(/test(/g' {} \;
  find tests/ -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/xit(/it(/g' {} \;
  find tests/ -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/xdescribe(/describe(/g' {} \;
  
  echo "Converted all x-skipped tests to regular tests"
else
  echo "No x-skipped test patterns found."
fi

# Clean up
rm -f skipped-tests-verbose.log

echo "All skipped tests should now be unskipped."
echo "Run tests with: bash check-tests.sh && bash enhance-test-filter.sh"
