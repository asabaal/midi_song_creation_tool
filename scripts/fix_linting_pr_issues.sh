#!/bin/bash
# fix_linting_pr_issues.sh - Addresses all issues with linting PR

# Colorful output functions
print_section() {
  echo -e "\n\033[1;36m==== $1 ====\033[0m"
}

print_success() {
  echo -e "\033[1;32m✓ $1\033[0m"
}

print_error() {
  echo -e "\033[1;31m✗ $1\033[0m"
}

print_warning() {
  echo -e "\033[1;33m! $1\033[0m"
}

print_info() {
  echo -e "\033[1;34mi $1\033[0m"
}

# Step 1: Backup everything
print_section "BACKING UP FILES"
mkdir -p .backup
cp package.json .backup/package.json
cp package-lock.json .backup/package-lock.json 2>/dev/null || echo "No package-lock.json to backup"
print_success "Backups created in .backup directory"

# Step 2: Fix linting issues
print_section "FIXING LINTING ISSUES"

# Generate list of linting issues
print_info "Checking for linting issues..."
npm run lint > linting_issues.txt 2>&1
if [ $? -eq 0 ]; then
  print_success "No linting issues found!"
  rm linting_issues.txt
else
  print_warning "Linting issues found. See linting_issues.txt for details"
  print_info "Attempting to fix linting issues automatically..."
  npm run lint:fix
  
  # Check if issues were fixed
  npm run lint > fixed_linting_issues.txt 2>&1
  if [ $? -eq 0 ]; then
    print_success "All linting issues were fixed automatically!"
    rm linting_issues.txt fixed_linting_issues.txt
  else
    print_warning "Some linting issues require manual fixing. Compare linting_issues.txt and fixed_linting_issues.txt"
  fi
fi

# Step 3: Fix Husky setup without triggering Cypress
print_section "SETTING UP HUSKY WITHOUT CYPRESS"

# Remove node_modules and package-lock to start clean
print_info "Cleaning installation..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Remove Cypress from package.json temporarily
print_info "Temporarily removing Cypress from package.json..."
CYPRESS_VERSION=$(grep -o '"cypress": *"[^"]*"' package.json || echo "")
sed -i '/cypress/d' package.json

# Setup Husky manually (modern approach)
print_info "Setting up Husky (modern approach)..."

# Install only husky and lint-staged without doing a full install
npm install --no-save husky lint-staged

# Setup Husky using modern approach
npm pkg set scripts.prepare="husky"

# Create husky directory
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
EOF

chmod +x .husky/pre-commit

# Create _/husky.sh file
mkdir -p .husky/_
cat > .husky/_/husky.sh << 'EOF'
#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  exit $exitCode
fi
EOF

chmod +x .husky/_/husky.sh

# Add lint-staged configuration to package.json if it doesn't exist
if ! grep -q '"lint-staged":' package.json; then
  print_info "Adding lint-staged configuration to package.json..."
  # Get the last line in package.json
  last_line=$(tail -n 1 package.json)
  
  # Create a temporary file
  cp package.json package.json.tmp
  
  # Add lint-staged configuration before the last line
  sed -i '$ d' package.json.tmp
  cat >> package.json.tmp << 'EOF'
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
EOF
  
  # Replace the original package.json
  mv package.json.tmp package.json
  print_success "Added lint-staged configuration to package.json"
fi

# Restore Cypress to package.json if it was present
if [ ! -z "$CYPRESS_VERSION" ]; then
  print_info "Restoring Cypress ($CYPRESS_VERSION) to package.json..."
  # Add Cypress back to package.json but don't install it
  sed -i '/"devDependencies": {/a\    '"$CYPRESS_VERSION"',' package.json
  print_success "Cypress restored to package.json (but NOT installed)"
fi

print_success "Husky setup completed without installing Cypress"

# Step 4: Apply formatting to all files
print_section "FORMATTING ALL FILES"
print_info "Running Prettier on all files..."
npm run format
print_success "All files formatted"

# Step 5: Verify branch readiness
print_section "VERIFYING BRANCH READINESS"

# Check for remaining linting issues
print_info "Final linting check..."
npm run lint > final_linting_check.txt 2>&1
if [ $? -eq 0 ]; then
  print_success "Linting check passed! No issues found."
  rm final_linting_check.txt
  linting_passed=true
else
  print_warning "Linting issues remain. See final_linting_check.txt for details."
  linting_passed=false
fi

# Check that all required files exist
required_files=(".eslintrc.js" ".prettierrc" ".eslintignore" ".prettierignore" "LINTING.md" ".husky/pre-commit")
files_missing=false

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    print_error "Missing required file: $file"
    files_missing=true
  fi
done

if [ "$files_missing" = false ]; then
  print_success "All required files are present"
fi

# Final verdict
print_section "PR READINESS VERDICT"

if [ "$linting_passed" = true ] && [ "$files_missing" = false ]; then
  print_success "Your branch is READY for PR! All checks passed."
else
  print_error "Your branch is NOT ready for PR. Please fix the issues listed above."
fi

print_info "What to include in your PR:"
echo "1. All linting configuration files (.eslintrc.js, .prettierrc, etc.)"
echo "2. Husky configuration (package.json changes, .husky directory)"
echo "3. LINTING.md documentation"
echo "4. Any fixes to linting issues in your code"

print_info "Troubleshooting:"
echo "* If you experience Cypress errors when using npm commands, run ./scripts/cypress_linting_fix.sh first"
echo "* If you need to restore your backups: cp .backup/* ."