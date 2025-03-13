#!/bin/bash

# A simple script to run specific tests and create a log file

# Default test pattern
test_pattern="$1"
output_file="test_output.log"

if [ -z "$test_pattern" ]; then
  echo "No test pattern provided, running all tests"
  test_pattern="."
fi

# Run the tests and capture the output
echo "Running tests matching pattern: $test_pattern"
echo "Saving full output to $output_file"

# Run tests and save output to file and display on terminal
npx jest --testPathPattern=$test_pattern --colors 2>&1 | tee "$output_file"

# Display a summary of the results
echo -e "\n=== Test Summary ==="
grep -E "PASS|FAIL" "$output_file" | sort | uniq -c

echo -e "\nTo see filtered results, run: bash filter-test-results.sh"
