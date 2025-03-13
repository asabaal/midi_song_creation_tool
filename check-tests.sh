#!/bin/bash

# A simple script to run specific tests and display the results

# Default test pattern
test_pattern="$1"

if [ -z "$test_pattern" ]; then
  echo "No test pattern provided, running all tests"
  test_pattern="."
fi

# Run the tests and capture the output
echo "Running tests matching pattern: $test_pattern"
npx jest --testPathPattern=$test_pattern --colors | tee test_output.log

# Display a summary of the results
echo -e "\n=== Test Summary ==="
grep -E "PASS|FAIL" test_output.log | sort | uniq -c

# Cleanup
rm test_output.log
