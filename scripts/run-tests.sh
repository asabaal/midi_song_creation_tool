#!/bin/bash
# run-tests.sh - Run all tests and generate reports

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   MIDI Song Creation Tool Test Runner      ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check if Jest and Cypress are installed
if ! [ -x "$(command -v npx)" ]; then
  echo -e "${RED}Error: npx is not installed.${NC}" >&2
  echo "Please install Node.js and npm first."
  exit 1
fi

# Create results directory
RESULTS_DIR="test-results"
mkdir -p $RESULTS_DIR

# Function to run a command and check its exit status
run_command() {
  echo -e "${YELLOW}Running: $1${NC}"
  eval $1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success: $2${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed: $2${NC}"
    return 1
  fi
}

# Parse command line arguments
RUN_UNIT=true
RUN_INTEGRATION=true
RUN_E2E=true
GENERATE_COVERAGE=true

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --no-unit) RUN_UNIT=false ;;
    --no-integration) RUN_INTEGRATION=false ;;
    --no-e2e) RUN_E2E=false ;;
    --no-coverage) GENERATE_COVERAGE=false ;;
    --help)
      echo "Usage: ./run-tests.sh [options]"
      echo "Options:"
      echo "  --no-unit         Skip unit tests"
      echo "  --no-integration  Skip integration tests"
      echo "  --no-e2e          Skip end-to-end tests"
      echo "  --no-coverage     Skip coverage report generation"
      echo "  --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown parameter: $1"
      echo "Use --help for usage information."
      exit 1
      ;;
  esac
  shift
done

# Start time
START_TIME=$(date +%s)

# Run unit tests if enabled
if $RUN_UNIT; then
  echo -e "\n${BLUE}Running Unit Tests${NC}"
  run_command "npx jest --selectProjects=server,client,core --json --outputFile=$RESULTS_DIR/unit-results.json" "Unit tests"
  UNIT_RESULT=$?
else
  echo -e "\n${YELLOW}Skipping Unit Tests${NC}"
  UNIT_RESULT=0
fi

# Run integration tests if enabled
if $RUN_INTEGRATION; then
  echo -e "\n${BLUE}Running Integration Tests${NC}"
  run_command "cross-env NODE_ENV=test npx jest tests/integration --json --outputFile=$RESULTS_DIR/integration-results.json" "Integration tests"
  INTEGRATION_RESULT=$?
else
  echo -e "\n${YELLOW}Skipping Integration Tests${NC}"
  INTEGRATION_RESULT=0
fi

# Run E2E tests if enabled
if $RUN_E2E; then
  echo -e "\n${BLUE}Running End-to-End Tests${NC}"
  run_command "npx cypress run --reporter json --reporter-options=\"output=$RESULTS_DIR/e2e-results.json\"" "End-to-end tests"
  E2E_RESULT=$?
else
  echo -e "\n${YELLOW}Skipping End-to-End Tests${NC}"
  E2E_RESULT=0
fi

# Generate coverage report if enabled
if $GENERATE_COVERAGE; then
  echo -e "\n${BLUE}Generating Coverage Report${NC}"
  run_command "npx jest --coverage --coverageReporters=text-summary --coverageReporters=lcov" "Coverage report"
  echo -e "Coverage report available at: ${YELLOW}coverage/lcov-report/index.html${NC}"
fi

# End time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Print summary
echo -e "\n${BLUE}=============================================${NC}"
echo -e "${BLUE}                Test Summary                ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo -e "Total time: ${DURATION} seconds"

if [ $UNIT_RESULT -eq 0 ] && [ $INTEGRATION_RESULT -eq 0 ] && [ $E2E_RESULT -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. See logs above for details.${NC}"
  exit 1
fi
