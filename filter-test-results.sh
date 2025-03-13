#!/bin/bash

# Run tests and save output
./run-tests.sh > full_test_output.log 2>&1

# Filter for just the important parts
echo "=== DUPLICATE MOCK WARNINGS ===" > filtered_results.log
grep "duplicate manual mock found" full_test_output.log >> filtered_results.log

echo -e "\n=== FAILING TESTS ===" >> filtered_results.log
grep -A 3 "FAIL " full_test_output.log >> filtered_results.log

echo -e "\n=== TEST SUMMARY ===" >> filtered_results.log
grep -A 3 "Test Suites:" full_test_output.log | tail -4 >> filtered_results.log

# Display the filtered results
cat filtered_results.log
