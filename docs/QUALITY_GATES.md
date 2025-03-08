# Quality Gates for MIDI Song Creation Tool

This document outlines the quality gates and branch protection rules that should be implemented to ensure code quality and stability.

## What are Quality Gates?

Quality gates are checkpoints that code must pass before it can proceed to the next stage of the development lifecycle. For our MIDI Song Creation Tool, quality gates ensure that:

1. All tests pass before code is merged
2. Code meets minimum coverage thresholds
3. Code follows style guidelines
4. Changes are reviewed by team members

## Branch Protection Rules

### Setting Up Branch Protection for `develop` and `main`

1. Go to your repository on GitHub: https://github.com/asabaal/midi_song_creation_tool
2. Click on **Settings**
3. In the left sidebar, click on **Branches**
4. Under "Branch protection rules", click **Add rule**
5. For "Branch name pattern", enter `develop` (repeat these steps later for `main`)
6. Check the following options:

#### Required Checks

- [x] **Require a pull request before merging**
  - [x] Require approvals (set to 1)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - After a successful CI run, the following checks should be selected:
    - [x] Test Suite (from GitHub Actions)
    - [x] Lint (from GitHub Actions)

- [x] **Require conversation resolution before merging**

#### Additional Protections

- [x] **Do not allow bypassing the above settings**
- [x] **Restrict who can push to matching branches** (optional, if you want only specific team members to push directly)

7. Click **Create** (or **Save changes** if editing an existing rule)
8. Repeat for the `main` branch

## Code Coverage Thresholds

We've set the following coverage thresholds in the `jest.config.js` file:

```javascript
coverageThreshold: {
  global: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70,
  },
  './src/core/': {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80,
  },
  './src/server/': {
    statements: 75,
    branches: 65,
    functions: 75,
    lines: 75,
  },
}
```

These thresholds ensure that:
- Core music functionality has at least 80% test coverage
- Server code has at least 75% test coverage
- Overall project has at least 70% test coverage

## Implementing in CI/CD

To enforce these quality gates in CI/CD, we've configured GitHub Actions workflows:

### Test Workflow (`.github/workflows/test.yml`)

This workflow runs on all pull requests to `develop` and `main` branches and ensures:
- All unit and integration tests pass
- End-to-end tests pass
- Coverage thresholds are met

### Lint Workflow (`.github/workflows/lint.yml`)

This workflow ensures:
- Code follows style guidelines
- No linting errors exist

## Pull Request Template

To standardize pull requests, we can add a PR template:

1. Create a `.github/pull_request_template.md` file
2. This template will automatically be used when creating new PRs

## Enforcing Quality Gates Locally

Developers can enforce these quality gates locally before pushing changes:

1. Run tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Run linting: `npm run lint`
4. Run the full test suite: `./scripts/run-tests.sh`

## Monitoring Quality Gates

After implementing these gates, you should:

1. Regularly review coverage reports
2. Update thresholds as the project matures
3. Add additional checks as needed
