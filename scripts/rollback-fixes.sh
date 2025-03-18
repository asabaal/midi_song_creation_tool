#!/bin/bash
# Rollback script for the fixes made to feature/project-structure

echo "Rolling back changes to feature/project-structure branch..."

# Store current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# Create a backup branch of current feature/project-structure state
echo "Creating backup branch feature/project-structure-backup..."
git branch -f feature/project-structure-backup feature/project-structure

# Reset to the state before our fixes
echo "Resetting feature/project-structure to state before fixes..."
git checkout feature/project-structure
git reset --hard cca60ec^4  # Goes back 4 commits to before our changes

echo "Rollback complete."
echo "Original branch state preserved as feature/project-structure-backup"
echo "Use 'git checkout feature/project-structure-backup' to access the backed up version."
