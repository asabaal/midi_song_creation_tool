#!/bin/bash

# Piano Roll Notes Display Issue Fix Rollback Script
# This script will restore the repository to the state before our fixes were applied

# Remember the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "This script will revert the piano roll display issue fixes."
echo "The commits to be reverted are:"
echo "1. 'Enhance SessionContext with improved error handling and debugging'"
echo "2. 'Enhance PianoRoll component with improved track selection and refresh'"
echo "3. 'Enhance PatternGenerator component with improved debugging and force refresh'"
echo "4. 'Fix API endpoint URL for pattern generation'"

read -p "Are you sure you want to proceed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Revert the commits in reverse order
    git revert --no-commit 6984d7d8dd303ee762701f9a0842cac7f97740dc
    git revert --no-commit 045b9034bc35b49f8781576d614a00f64614af01
    git revert --no-commit 915a49af0f726ae83ffbf07c4ab2c9034aaebe25
    git revert --no-commit c6ca1f3dff39057b12b9ef687f2485c40f11fb4e
    
    # Create a new commit with all the reverted changes
    git commit -m "Revert piano roll display issue fixes"
    
    echo "Changes have been reverted successfully!"
    echo "You can now run 'npm run dev' to test if the rollback was successful."
else
    echo "Rollback cancelled."
fi
