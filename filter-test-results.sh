#!/bin/bash

# A helper script to filter test results and show only relevant information

# Default input file is the last test run output
input_file="${1:-test_output.log}"

if [ ! -f "$input_file" ]; then
  echo "Error: File $input_file not found."
  exit 1
fi

echo -e "\n=== Filtered Test Results ==="

# Extract and display failing tests with their error messages
echo -e "\n--- Failed Tests ---"
grep -A 15 "● " "$input_file" | grep -v "at Object\." | grep -v "node_modules" | grep -v "^$"

# Extract and display the summary
echo -e "\n--- Summary ---"
grep -E "Test Suites:|Tests:|Time:|Ran all test" "$input_file"

echo -e "\nEnd of filtered results."
