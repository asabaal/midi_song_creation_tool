#!/bin/bash

# Step 1: Remove duplicate mock files
echo "Removing duplicate mock files..."
rm -rf tests/__mocks__

# Step 2: Run tests
echo "Running tests..."
./run-tests.sh > full_test_output.log 2>&1

# Step 3: Filter for important parts
echo "=== TEST SUMMARY ===" > test_summary.log
grep -A 3 "Test Suites:" full_test_output.log | tail -4 >> test_summary.log

# Check if there are any failing tests
FAIL_COUNT=$(grep -c "FAIL " full_test_output.log)

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "=== SUCCESS: ALL TESTS PASSING! ===" >> test_summary.log
else
  echo "=== FAILING TESTS ===" >> test_summary.log
  grep -A 3 "FAIL " full_test_output.log >> test_summary.log
fi

# Display the filtered results
cat test_summary.log

# Exit with success if no failing tests
if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
