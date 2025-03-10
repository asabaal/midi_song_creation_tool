#!/bin/bash
# Cleanup script for project-structure branch

set -e  # Exit on any error

echo "========================================================"
echo "Cleanup Script for Project Structure Branch"
echo "========================================================"
echo "This script will remove testing and linting files"
echo "from the feature/project-structure branch."
echo ""

# Remove testing files
echo "Removing testing files..."
git rm -f jest.config.js jest.setup.js 2>/dev/null || true
git rm -rf tests/ 2>/dev/null || true
git rm -rf test-results/ 2>/dev/null || true

# Remove linting files
echo "Removing linting files..."
git rm -f .eslintrc .eslintrc.js .eslintrc.json .prettierrc 2>/dev/null || true

# Remove scripts related to testing and linting
echo "Removing related scripts..."
git rm -f scripts/fix_* 2>/dev/null || true
git rm -f scripts/format-code.sh 2>/dev/null || true
git rm -f scripts/local_test.sh 2>/dev/null || true
git rm -f scripts/run-tests.sh 2>/dev/null || true
git rm -f scripts/test-* 2>/dev/null || true
git rm -f scripts/run-all-tests.sh 2>/dev/null || true

# Commit changes
echo "Committing changes..."
git commit -m "Remove testing and linting files from project structure branch"

# Push changes
echo "Pushing changes to remote..."
git push origin feature/project-structure

echo ""
echo "========================================================"
echo "Cleanup completed successfully!"
echo "========================================================"
echo ""
echo "Next steps:"
echo "1. Go to GitHub repository"
echo "2. Create a pull request from feature/project-structure to develop"
echo "3. Use the content from PR_DESCRIPTION.md as your PR description"
echo "4. Request reviews and merge the PR when approved"
echo ""
