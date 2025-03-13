#!/bin/bash

# A more advanced test filtering script to create more concise output
# Usage: bash enhance-test-filter.sh [test_output_file]

input_file="${1:-test_output.log}"

if [ ! -f "$input_file" ]; then
  echo "Error: File $input_file not found."
  echo "Please run 'bash check-tests.sh' first to generate test results."
  exit 1
fi

# Clear the screen for better visibility
clear

echo -e "\n===== ENHANCED TEST RESULTS SUMMARY =====\n"

# Create a temporary file for processing
temp_file=$(mktemp)

# Extract unique error messages and organize them by type
echo -e "--- UNIQUE ERROR TYPES ---\n" > "$temp_file"

# 1. SessionContext errors
grep -A 2 "SessionContext not available" "$input_file" | head -3 >> "$temp_file"
echo -e "\nNumber of SessionContext errors: $(grep -c "SessionContext not available" "$input_file")\n" >> "$temp_file"

# 2. Transport update errors
grep -A 2 "expect(updateTransportMock).toHaveBeenCalledWith" "$input_file" | head -3 >> "$temp_file"
echo -e "\nNumber of updateTransport errors: $(grep -c "expect(updateTransportMock).toHaveBeenCalledWith" "$input_file")\n" >> "$temp_file"

# 3. Component errors
grep -A 2 "Element type is invalid" "$input_file" | head -3 >> "$temp_file"
echo -e "\nNumber of invalid element errors: $(grep -c "Element type is invalid" "$input_file")\n" >> "$temp_file"

# 4. API endpoint errors
grep -A 2 "expected 200 \"OK\", got 404 \"Not Found\"" "$input_file" | head -3 >> "$temp_file"
echo -e "\nNumber of 404 API errors: $(grep -c "expected 200 \"OK\", got 404 \"Not Found\"" "$input_file")\n" >> "$temp_file"

# 5. Extract key failing test cases (without duplicates)
echo -e "--- KEY FAILING TESTS ---\n" >> "$temp_file"
grep -E "● [^●]+" "$input_file" | sort | uniq >> "$temp_file"

# 6. Include test summary
echo -e "\n--- SUMMARY ---" >> "$temp_file"
grep -E "Test Suites:|Tests:|Time:|Ran all test" "$input_file" >> "$temp_file"

# Display the processed output
cat "$temp_file"
echo -e "\nEnd of enhanced test results."

# Cleanup
rm "$temp_file"
