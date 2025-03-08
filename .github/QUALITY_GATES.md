# Quality Gates for MIDI Song Creation Tool

This document outlines the quality gates for the MIDI Song Creation Tool project and how to work with them.

## Overview of Quality Gates

Quality gates are automated checks that ensure code meets certain standards before it can be merged into important branches (like `main` or `develop`). They help maintain code quality, prevent regressions, and ensure consistent coding practices.

Our quality gates include:

1. **Linting checks** - Ensure code adheres to style guidelines
2. **Unit tests** - Verify individual functions and components work as expected
3. **Integration tests** - Test API endpoints and module interactions
4. **End-to-end tests** - Test full application workflows
5. **Code coverage** - Ensure sufficient test coverage

## GitHub Action Workflows

We have the following GitHub Action workflows:

1. **Lint (`lint.yml`)** - Runs ESLint and Prettier
2. **Test Suite (`test.yml`)** - Runs all tests and reports coverage

These workflows automatically run on pull requests to `main` or `develop` branches and directly on pushes to these branches.

## Fixing Linting Issues

The initial linting setup revealed several issues that need addressing:

### Module Import/Export

Some files were using ES6 module syntax (`import`/`export`) but were configured to use CommonJS. We've updated the configuration to support both:

- Added `sourceType: 'module'` to parserOptions in ESLint config
- Updated Cypress and Jest files to use the appropriate syntax

### Cypress Tests

Cypress tests had many `'cy' is not defined` errors. We've added:

- A Cypress-specific ESLint configuration
- Global declarations for Cypress variables
- A separate `.eslintrc.js` in the Cypress directory

### Ongoing Work

To continue fixing these issues:

1. **Fix incrementally**:
   ```bash
   # Fix issues in one directory at a time
   npx eslint src/core --fix
   npx eslint src/server --fix
   ```

2. **Automate formatting**:
   ```bash
   # Format all files
   npm run format
   ```

3. **Tackle warnings first**:
   - Unused variables
   - Console statements that should be removed
   - Line length issues

## Running the Local Test Script

The `scripts/local_test.sh` script runs all checks locally before pushing:

```bash
# Make executable
chmod +x scripts/local_test.sh

# Run
./scripts/local_test.sh
```

This script has been temporarily modified to focus on the most critical checks first, specifically:

- ESLint checks on the `src/` directory
- Prettier checks on the `src/` directory
- Unit tests
- Integration tests

The E2E tests are temporarily skipped while we fix the linting issues with Cypress files.

## Future Improvements

As the project evolves, consider:

1. **Adding pre-commit hooks** to run linting/testing before commits
2. **Customizing ESLint rules** to better match project needs
3. **Improving test coverage thresholds** as the codebase matures
4. **Adding performance testing** for critical MIDI operations

## Questions?

If you have questions about the quality gates, contact the project maintainers for guidance.
