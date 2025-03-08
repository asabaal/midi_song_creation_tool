# Branch Protection Setup Guide

This document explains how to set up branch protection rules to enforce quality gates for the MIDI Song Creation Tool repository.

## Protection Rules for Main Branches

### Protected Branches

The following branches should be protected:
- `main` - Production-ready code
- `develop` - Integration branch for features

## How to Set Up Branch Protection

1. Go to your repository on GitHub: https://github.com/asabaal/midi_song_creation_tool
2. Click on "Settings" in the top navigation bar
3. In the left sidebar, click on "Branches"
4. Under "Branch protection rules", click "Add rule"
5. For "Branch name pattern", enter `main` (or `develop` for the development branch)

### Required Settings

Configure the following settings:

#### Basic Protection

- [x] **Require a pull request before merging**
  - [x] Require approvals (at least 1)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks to require:
    - `Test Suite` (runs unit and integration tests)
    - `Lint` (ensures code style compliance)

#### Additional Protections (Optional but Recommended)

- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings**

### Settings for Develop Branch

For the `develop` branch, you may use slightly less strict settings:

- [x] **Require a pull request before merging**
  - [x] Require approvals (at least 1)
  
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks to require:
    - `Test Suite` (runs unit and integration tests)

## Branch Naming Conventions

To maintain organization, please follow these branch naming conventions:

- `feature/feature-name` - For new features
- `bugfix/issue-description` - For bug fixes
- `hotfix/issue-description` - For critical production fixes
- `release/version-number` - For release preparations

## Flow for Making Changes

1. Create a new branch from `develop` using the appropriate naming convention
2. Make your changes and commit them
3. Push your branch to GitHub
4. Create a pull request targeting `develop`
5. Ensure all CI checks pass
6. Get at least one code review approval
7. Merge your changes

For releasing to production, create a PR from `develop` to `main` after thorough testing.
