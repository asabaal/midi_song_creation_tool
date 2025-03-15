#!/bin/bash
# Script to remove test files from feature/linting-only branch

echo -e "\n\033[1;36m==== REMOVING TEST FILES FROM LINTING BRANCH ====\033[0m"

# 1. Get current branch to verify we're on the right one
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "feature/linting-only" ]; then
  echo -e "\033[1;31m✗ Error: You must be on feature/linting-only branch. Current branch: $current_branch\033[0m"
  exit 1
fi

# 2. Create a backup branch in case we need to recover
echo -e "\033[1;34mi Creating backup branch...\033[0m"
backup_branch="feature/linting-only-backup-$(date +%Y%m%d%H%M%S)"
git branch $backup_branch
echo -e "\033[1;32m✓ Created backup branch: $backup_branch\033[0m"

# 3. Remove all test-related directories and files
echo -e "\033[1;34mi Removing test files and directories...\033[0m"

# List of test directories and files to remove
test_paths=(
  "tests/"
  "cypress.config.js"
  "jest.config.js"
  "**/cypress/"
  "**/test/"
  "**/tests/"
  "**/*.test.js"
  "**/*.test.jsx"
  "**/*.spec.js"
  "**/*.spec.jsx"
  "**/*.cy.js"
  "**/__tests__/"
  "**/__mocks__/"
)

# Remove each path if it exists
for path in "${test_paths[@]}"; do
  # Use git rm if files are tracked, otherwise just remove them
  if git ls-files "$path" &>/dev/null; then
    git rm -r --cached "$path" 2>/dev/null || true
    echo -e "\033[1;32m✓ Removed from git: $path\033[0m"
  fi
  
  # If it's a directory that physically exists, keep it but remove contents
  if [[ -d "$path" ]]; then
    rm -rf "$path" 2>/dev/null || true
    mkdir -p "$path" 2>/dev/null || true
    touch "$path/.gitkeep" 2>/dev/null || true
    echo -e "\033[1;32m✓ Removed directory contents: $path\033[0m"
  fi
done

# 4. Stage the removals
git add -A

# 5. Final verification
echo -e "\n\033[1;36m==== VERIFICATION ====\033[0m"
echo -e "\033[1;34mi The following linting-related files are retained:\033[0m"
git ls-files | grep -i "lint\|eslint\|prettier"
echo ""

echo -e "\033[1;34mi Current status (files to be committed):\033[0m"
git status

echo -e "\n\033[1;32m✓ Test files have been removed!\033[0m"
echo -e "\033[1;34mi Ready to commit? Run: git commit -m \"Remove test files from linting branch\"\033[0m"
echo -e "\033[1;34mi Then push to remote: git push origin feature/linting-only\033[0m"
echo -e "\033[1;34mi If anything went wrong, you can restore from backup: git reset --hard $backup_branch\033[0m"
