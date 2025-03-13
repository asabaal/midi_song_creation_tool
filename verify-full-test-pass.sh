#!/bin/bash

# Script to verify all tests are running and nothing is skipped

# Run Jest with the --no-cache flag to ensure fresh results
echo "Running tests with no cache to ensure accurate results..."
npx jest --no-cache > full-test-results.log 2>&1

# Check for skipped tests
SKIPPED_COUNT=$(grep -o "skipped" full-test-results.log | wc -l)

if [ "$SKIPPED_COUNT" -gt 0 ]; then
  echo "Found $SKIPPED_COUNT skipped tests."
  echo "Running unskip script again..."
  bash unskip-final-tests.sh
  
  # Run tests again to verify
  echo "Running tests again to verify all tests are now running..."
  npx jest --no-cache > full-test-results-after-fix.log 2>&1
  
  # Check again for skipped tests
  SKIPPED_COUNT_AFTER=$(grep -o "skipped" full-test-results-after-fix.log | wc -l)
  
  if [ "$SKIPPED_COUNT_AFTER" -gt 0 ]; then
    echo "Still found $SKIPPED_COUNT_AFTER skipped tests after fixing."
    echo "These tests may be skipped within conditional logic or dynamically."
    echo "Manual inspection may be required."
  else
    echo "Success! All tests are now running with no skips."
  fi
else
  echo "Success! No skipped tests found. All tests are running."
fi

# Check for failing tests
FAILING_COUNT=$(grep -o "failing" full-test-results.log | wc -l)

if [ "$FAILING_COUNT" -gt 0 ]; then
  echo "Warning: Found $FAILING_COUNT failing tests."
  echo "Some tests may need additional fixes."
else
  echo "All tests are passing! The test suite is fully operational."
fi

# Create a final summary report
echo -e "\n===== FINAL TEST STATUS REPORT =====" > test-status-report.txt
echo "Date: $(date)" >> test-status-report.txt
echo "Total test suites: $(grep -o "Test Suites:" full-test-results.log | cut -d' ' -f3-)" >> test-status-report.txt
echo "Total tests: $(grep -o "Tests:" full-test-results.log | cut -d' ' -f2-)" >> test-status-report.txt
echo "Skipped tests: $SKIPPED_COUNT" >> test-status-report.txt
echo "Failing tests: $FAILING_COUNT" >> test-status-report.txt
echo -e "\nTest suite is $([ "$SKIPPED_COUNT" -eq 0 ] && [ "$FAILING_COUNT" -eq 0 ] && echo "FULLY OPERATIONAL" || echo "NEEDS ATTENTION")" >> test-status-report.txt
echo "===================================" >> test-status-report.txt

echo "Test status report saved to test-status-report.txt"

# Clean up log files
rm -f full-test-results.log full-test-results-after-fix.log

echo "Verification complete."
