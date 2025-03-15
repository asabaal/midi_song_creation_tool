#!/bin/bash
# prepare_linting_pr.sh - Script to check and prepare the linting branch for PR

# Functions for colorful output
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

# Step 1: Check for required files
print_section "CHECKING REQUIRED FILES"

# Array of required files
required_files=(".eslintrc.js" ".prettierrc" ".eslintignore" ".prettierignore")
missing_files=()

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    print_success "Found $file"
  else
    print_error "Missing $file"
    missing_files+=("$file")
  fi
done

# Create missing files if needed
if [ ${#missing_files[@]} -ne 0 ]; then
  print_info "Creating missing files..."
  
  for file in "${missing_files[@]}"; do
    case $file in
      ".eslintrc.js")
        cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'import', 'jsx-a11y'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
EOF
        print_success "Created .eslintrc.js"
        ;;
      ".prettierrc")
        cat > .prettierrc << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
EOF
        print_success "Created .prettierrc"
        ;;
      ".eslintignore")
        cat > .eslintignore << 'EOF'
node_modules/
dist/
build/
coverage/
public/
EOF
        print_success "Created .eslintignore"
        ;;
      ".prettierignore")
        cat > .prettierignore << 'EOF'
node_modules/
dist/
build/
coverage/
public/
package-lock.json
EOF
        print_success "Created .prettierignore"
        ;;
    esac
  done
fi

# Step 2: Check package.json scripts
print_section "CHECKING PACKAGE.JSON SCRIPTS"

if [ -f "package.json" ]; then
  print_success "Found package.json"
  
  # Check for required scripts
  lint_script=$(grep -o '"lint": *"[^"]*"' package.json || echo "")
  lint_fix_script=$(grep -o '"lint:fix": *"[^"]*"' package.json || echo "")
  format_script=$(grep -o '"format": *"[^"]*"' package.json || echo "")
  
  scripts_to_add=()
  if [ -z "$lint_script" ]; then
    print_warning "Missing 'lint' script in package.json"
    scripts_to_add+=("  \"lint\": \"eslint .\"")
  else
    print_success "Found 'lint' script"
  fi
  
  if [ -z "$lint_fix_script" ]; then
    print_warning "Missing 'lint:fix' script in package.json"
    scripts_to_add+=("  \"lint:fix\": \"eslint . --fix\"")
  else
    print_success "Found 'lint:fix' script"
  fi
  
  if [ -z "$format_script" ]; then
    print_warning "Missing 'format' script in package.json"
    scripts_to_add+=("  \"format\": \"prettier --write \\\"**/*.{js,jsx,ts,tsx,json,css,scss,md}\\\"\"")
  else
    print_success "Found 'format' script"
  fi
  
  # Add missing scripts if needed
  if [ ${#scripts_to_add[@]} -ne 0 ]; then
    print_info "Adding missing scripts to package.json..."
    
    # Create a temporary file
    cp package.json package.json.tmp
    
    # Find the "scripts" section and add the missing scripts
    scripts_section_line=$(grep -n '"scripts": {' package.json | cut -d':' -f1)
    if [ -n "$scripts_section_line" ]; then
      # Prepare the scripts to add
      scripts_text=$(printf ",\n%s" "${scripts_to_add[@]}")
      scripts_text=${scripts_text:1}  # Remove leading comma
      
      # Insert the scripts after the "scripts": { line
      sed -i "$((scripts_section_line+1))i\\
$scripts_text" package.json.tmp
      
      # Replace the original package.json
      mv package.json.tmp package.json
      print_success "Updated package.json with missing scripts"
    else
      print_error "Could not find 'scripts' section in package.json"
      rm package.json.tmp
    fi
  fi
else
  print_error "package.json not found"
fi

# Step 3: Create or update LINTING.md
print_section "CREATING/UPDATING LINTING.md"

if [ -f "LINTING.md" ]; then
  print_success "Found LINTING.md"
else
  print_info "Creating LINTING.md documentation..."
  
  cat > LINTING.md << 'EOF'
# Linting and Code Formatting

This project uses ESLint and Prettier to enforce consistent code style and catch potential issues.

## Setup

The following tools are used:

- **ESLint**: For static code analysis and enforcing coding standards
- **Prettier**: For consistent code formatting
- **eslint-plugin-react**: React-specific linting rules
- **eslint-plugin-import**: Rules for proper imports
- **eslint-plugin-jsx-a11y**: Accessibility rules for JSX

## Configuration Files

- `.eslintrc.js`: ESLint configuration
- `.prettierrc`: Prettier configuration
- `.eslintignore`: Files to be ignored by ESLint
- `.prettierignore`: Files to be ignored by Prettier

## Available Commands

Run these commands from the project root:

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically where possible
npm run lint:fix

# Format code with Prettier
npm run format
```

## Enforced Rules

### ESLint Rules

- Basic JavaScript best practices
- React-specific rules (no need for React import, prop-types warnings)
- Import organization
- Accessibility (jsx-a11y)
- Warnings for console statements

### Prettier Rules

- Single quotes
- 2-space tabs
- 100 character line length
- Semicolons at the end of statements
- Trailing commas in objects and arrays
- LF line endings

## Troubleshooting

If you encounter linting errors:

1. Run `npm run lint:fix` to automatically fix many issues
2. For formatting issues, run `npm run format`
3. For remaining issues, manually fix them following the error messages

If ESLint or Prettier isn't working:

1. Make sure all dependencies are installed: `npm install`
2. Check that the configuration files exist and have correct content
3. Try restarting your editor or IDE

## Pre-commit Hooks (Optional)

If using Husky and lint-staged (optional setup):

- Linting and formatting are automatically run on staged files before commit
- To bypass pre-commit hooks temporarily, use `git commit --no-verify`
EOF
  
  print_success "Created LINTING.md"
fi

# Step 4: Test linting commands
print_section "TESTING LINTING COMMANDS"

print_info "Running lint command..."
npm run lint &> /dev/null
if [ $? -eq 0 ]; then
  print_success "Linting command works"
else
  print_warning "Linting command returned errors/warnings (this may be normal for real issues)"
fi

print_info "Running lint:fix command..."
npm run lint:fix &> /dev/null
if [ $? -eq 0 ]; then
  print_success "Lint:fix command works"
else
  print_warning "Lint:fix command returned errors/warnings (this may be normal for real issues)"
fi

print_info "Running format command..."
npm run format &> /dev/null
if [ $? -eq 0 ]; then
  print_success "Format command works"
else
  print_warning "Format command returned errors/warnings (this may be normal for real issues)"
fi

# Step 5: Optional pre-commit hooks setup
print_section "PRE-COMMIT HOOKS (OPTIONAL)"

read -p "Do you want to set up pre-commit hooks with Husky? (y/n): " setup_hooks

if [[ $setup_hooks == "y" || $setup_hooks == "Y" ]]; then
  print_info "Setting up pre-commit hooks..."
  
  # Install husky and lint-staged
  npm install --save-dev husky lint-staged
  
  # Initialize husky
  npx husky install
  npm pkg set scripts.prepare="husky install"
  
  # Add pre-commit hook
  npx husky add .husky/pre-commit "npx lint-staged"
  
  # Add lint-staged configuration to package.json
  if grep -q '"lint-staged":' package.json; then
    print_success "lint-staged configuration already exists in package.json"
  else
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
  
  print_success "Pre-commit hooks setup complete"
else
  print_info "Skipping pre-commit hooks setup"
fi

# Final summary
print_section "PR READINESS SUMMARY"

# Count issues
issues=0
if [ ${#missing_files[@]} -ne 0 ]; then 
  issues=$((issues+1))
fi

if [ -z "$lint_script" ] || [ -z "$lint_fix_script" ] || [ -z "$format_script" ]; then
  issues=$((issues+1))
fi

if [ ! -f "LINTING.md" ]; then
  issues=$((issues+1))
fi

if [ $issues -eq 0 ]; then
  print_success "Your branch is ready for PR! All checks passed."
else
  print_warning "Your branch needs attention in $issues area(s). Please review the output above."
fi

print_info "Next steps:"
echo "1. Review any warnings or errors above"
echo "2. Try running the linting commands manually: npm run lint, npm run lint:fix, npm run format"
echo "3. Create a PR for the branch when ready"