#!/bin/bash

# A helper script to filter test results and show only relevant information

# Default input file is "test_output.log"
input_file="${1:-test_output.log}"

if [ ! -f "$input_file" ]; then
  echo "Error: File $input_file not found."
  echo "Please run 'bash check-tests.sh' first to generate test results."
  exit 1
fi

# Clear the screen for better visibility
clear

echo -e "\n===== FILTERED TEST RESULTS =====\n"

# Extract and display failing tests with their error messages
echo -e "--- FAILED TESTS ---"
if grep -q "● " "$input_file"; then
  grep -A 15 "● " "$input_file" | grep -v "at Object\." | grep -v "node_modules" | grep -v "^$"
else
  echo "No failing tests found! 🎉"
fi

# Extract and display the summary
echo -e "\n--- SUMMARY ---"
grep -E "Test Suites:|Tests:|Time:|Ran all test" "$input_file"

echo -e "\nEnd of filtered results."
