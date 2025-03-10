# Cleanup Instructions for Testing Suite Branch

To focus only on testing infrastructure changes, the following linting/formatting files should be removed from this branch:

## Linting Files to Remove:
- `.eslintrc`
- `.eslintrc.js`
- `.eslintrc.json`
- `.prettierrc`
- Linting scripts in the `scripts/` directory

## Manual Execution
```bash
# Remove linting files
git rm -f .eslintrc
git rm -f .eslintrc.js
git rm -f .eslintrc.json
git rm -f .prettierrc

# Remove linting related scripts
git rm -f scripts/fix_*
git rm -f scripts/format-code.sh

# Commit the changes
git commit -m "Remove linting files from testing-suite-only branch"
```

Make sure to execute these commands when you're ready to finalize this branch.
