# Contributing to MIDI Song Creation Tool

This document provides guidelines for contributing to the MIDI Song Creation Tool project. Please read it carefully before submitting any pull requests.

## Quality Gates

To maintain high quality code and prevent regressions, all pull requests must pass the following quality gates:

1. **Automated Tests**: All tests must pass
2. **Code Coverage**: Coverage must meet minimum thresholds (70% overall, 80% for core modules)
3. **Lint Checks**: Code must adhere to the project's style guide
4. **Code Review**: At least one maintainer approval required

## Branch Protection Rules

The main branches (`main` and `develop`) are protected by the following rules:

1. Pull request reviews are required before merging
2. Status checks must pass before merging:
   - All unit, integration, and E2E tests must pass
   - Code coverage thresholds must be met
   - Linting checks must pass
3. Branch must be up to date before merging
4. Force pushes are not allowed

## Setting Up Branch Protection (for Maintainers)

If you're a repository maintainer, here's how to set up branch protection rules in GitHub:

1. Go to the repository settings
2. Navigate to "Branches" in the sidebar
3. Under "Branch protection rules", click "Add rule"
4. Enter the branch name pattern (`main` or `develop`)
5. Check "Require pull request reviews before merging"
6. Check "Require status checks to pass before merging"
7. Select the status checks:
   - `Test Suite` (unit and integration tests)
   - `Lint` (code style checks)
   - `Coverage` (code coverage checks)
8. Check "Require branches to be up to date before merging"
9. Check "Do not allow bypassing the above settings"
10. Click "Create" or "Save changes"

These rules help maintain code quality and ensure that changes to key branches meet the project's standards.
