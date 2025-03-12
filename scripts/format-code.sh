#!/bin/bash
# Combined script for linting and formatting

# Make script execute from project root regardless of where it's called from
cd "$(dirname "$0")/.." || exit

# Define colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting code formatting and linting...${NC}"

# 1. Run ESLint
echo -e "\n${YELLOW}Running ESLint...${NC}"
if npx eslint . --ext .js,.jsx; then
    echo -e "${GREEN}ESLint passed!${NC}"
else
    echo -e "${RED}ESLint found issues.${NC}"
    
    # Ask to fix automatically
    read -p "Would you like to fix automatically? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Fixing ESLint issues...${NC}"
        npx eslint . --ext .js,.jsx --fix
    fi
fi

# 2. Run Prettier
echo -e "\n${YELLOW}Running Prettier...${NC}"
if npx prettier --check "**/*.{js,jsx,json,md}"; then
    echo -e "${GREEN}Prettier check passed!${NC}"
else
    echo -e "${RED}Prettier found formatting issues.${NC}"
    
    # Ask to fix automatically
    read -p "Would you like to format automatically? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Formatting with Prettier...${NC}"
        npx prettier --write "**/*.{js,jsx,json,md}"
    fi
fi

# 3. Fix whitespace issues
echo -e "\n${YELLOW}Checking for whitespace issues...${NC}"
node scripts/fix_whitespace.js

echo -e "\n${GREEN}Code formatting and linting complete!${NC}"
