# Linting Branch - Cleanup Plan

I've analyzed the branch and identified the following files that need to be removed to focus only on linting and code formatting changes.

## Files to Remove

### Testing Files:
- `jest.config.js`
- `jest.setup.js`
- `tests/` directory
- `test-results/` directory

### Scripts to Remove:
- `scripts/local_test.sh`
- `scripts/run-tests.sh`
- `scripts/test-*` files
- `scripts/run-all-tests.sh`

## Next Steps

Since GitHub's API doesn't allow directly deleting files through this interface, please follow these steps:

1. Clone the repository locally if you haven't already:
```bash
git clone https://github.com/asabaal/midi_song_creation_tool.git
cd midi_song_creation_tool
```

2. Checkout the linting-only branch:
```bash
git checkout feature/linting-only
```

3. Run the following commands to remove testing files:
```bash
# Remove testing files
git rm -f jest.config.js jest.setup.js
git rm -rf tests/
git rm -rf test-results/

# Remove related scripts
git rm -f scripts/local_test.sh
git rm -f scripts/run-tests.sh
git rm -f scripts/test-*
git rm -f scripts/run-all-tests.sh
```

4. Commit the changes:
```bash
git commit -m "Remove testing files from linting-only branch"
```

5. Push the changes:
```bash
git push origin feature/linting-only
```

6. After the project-structure and testing-suite PRs are merged, create a PR for the `feature/linting-only` branch into `develop` using the description in PR_DESCRIPTION.md

After all three PRs are merged, the original `feature/testing-suite` branch can be deleted.
