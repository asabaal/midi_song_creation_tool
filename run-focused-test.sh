#!/bin/bash

# Check if a test file path is provided
if [ -z "$1" ]; then
  echo "Please provide a test file path."
  echo "Example: ./run-focused-test.sh tests/integration/api/sessionApi.test.js"
  exit 1
fi

# Run the specific test and save output
npx jest "$1" > focused_test_output.log 2>&1

# Filter for just the important parts
echo "=== TEST RESULTS FOR $1 ===" > focused_results.log
grep -A 3 "PASS\|FAIL" focused_test_output.log >> focused_results.log

echo -e "\n=== ERRORS IF ANY ===" >> focused_results.log
grep -A 10 "Error:" focused_test_output.log >> focused_results.log

echo -e "\n=== TEST SUMMARY ===" >> focused_results.log
grep -A 3 "Test Suites:" focused_test_output.log | tail -4 >> focused_results.log

# Display the filtered results
cat focused_results.log
