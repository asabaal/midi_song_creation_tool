# Cleanup Instructions for Linting Branch

To focus only on linting and formatting changes, the following testing files should be removed from this branch:

## Testing Files to Remove:
- `jest.config.js`
- `jest.setup.js`
- The entire `tests/` directory
- The entire `test-results/` directory
- Any test-specific scripts in `scripts/` directory

## Manual Execution
```bash
# Remove testing files
git rm -f jest.config.js
git rm -f jest.setup.js
git rm -rf tests/
git rm -rf test-results/

# Remove test related scripts
git rm -f scripts/local_test.sh
git rm -f scripts/run-tests.sh
git rm -f scripts/test-*
git rm -f scripts/run-all-tests.sh

# Commit the changes
git commit -m "Remove testing files from linting-only branch"
```

Make sure to execute these commands when you're ready to finalize this branch.
