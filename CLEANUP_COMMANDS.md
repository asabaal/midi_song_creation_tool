# Cleanup Instructions for Project Structure Branch

To focus only on project structure changes, the following files should be removed from this branch:

## Testing Files to Remove:
- `jest.config.js`
- `jest.setup.js`
- The entire `tests/` directory
- The entire `test-results/` directory
- Any test-specific scripts in `scripts/` directory

## Linting Files to Remove:
- `.eslintrc`
- `.eslintrc.js`
- `.eslintrc.json`
- `.prettierrc`
- Linting scripts in the `scripts/` directory

## Manual Execution
```bash
# Remove testing files
git rm -f jest.config.js
git rm -f jest.setup.js
git rm -rf tests/
git rm -rf test-results/

# Remove linting files
git rm -f .eslintrc
git rm -f .eslintrc.js
git rm -f .eslintrc.json
git rm -f .prettierrc

# Remove related scripts
git rm -f scripts/fix_*
git rm -f scripts/format-code.sh
git rm -f scripts/local_test.sh
git rm -f scripts/run-tests.sh
git rm -f scripts/test-*

# Commit the changes
git commit -m "Remove testing and linting files from project structure branch"
```

Make sure to execute these commands when you're ready to finalize this branch.
