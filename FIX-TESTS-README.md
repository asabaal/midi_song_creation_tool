# Testing Suite Fix Instructions

This document explains how to fix the testing issues in the MIDI Song Creation Tool.

## Step 1: Run the Test Filter Script

First, make sure the test filter script is executable and use it to get a clearer picture of the failures:

```bash
chmod +x enhance-test-filter.sh
bash check-tests.sh && bash enhance-test-filter.sh
```

This will run all tests and generate a concise summary of the issues.

## Step 2: Apply Client Component Fixes

The component tests are failing because of import path issues and missing mocks. Run:

```bash
chmod +x tests/client-path-fix.sh
bash tests/client-path-fix.sh
```

This script:
- Creates SessionContext mocks at the correct path
- Links both `context` and `contexts` paths for compatibility

## Step 3: Apply API Endpoint Fixes

The API tests are failing with 404 errors, especially for sharp notes in music theory routes. Run:

```bash
chmod +x tests/api-path-fix.sh
bash tests/api-path-fix.sh
```

This script:
- Improves URL encoding handling in the music theory routes
- Creates a proper test setup for the API integration tests

## Step 4: Run Tests Again

After applying all fixes, run the tests again to see the improvements:

```bash
bash check-tests.sh && bash enhance-test-filter.sh
```

## Step 5: Fix Remaining Issues

If there are still failing tests, you can examine the enhanced error report and address each issue individually. The most common remaining issues may be:

1. Component rendering problems: Check the component export/import paths
2. API endpoint issues: Make sure the routes are correctly registered
3. Mock implementation details: Ensure mocks provide the expected functionality

## Troubleshooting

If the fixes don't work or make things worse, you can use the rollback script:

```bash
chmod +x rollback.sh
bash rollback.sh
```

This will remove any unnecessary files while keeping the helpful error filtering script.
