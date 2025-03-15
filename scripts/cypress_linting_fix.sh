#!/bin/bash
# cypress_linting_fix.sh - Script to fix Cypress and linting installation issues

# Step 1: Create backups
echo "Creating backups..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || echo "No package-lock.json found"

# Step 2: Clean everything thoroughly
echo "Cleaning installation..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Step 3: Temporarily modify package.json to remove Cypress
echo "Temporarily removing Cypress from package.json..."
# Capture Cypress version if present
CYPRESS_VERSION=$(grep -o '"cypress": *"[^"]*"' package.json || echo "")
# Remove Cypress line from package.json
sed -i '/cypress/d' package.json

# Step 4: Install linting dependencies
echo "Installing linting dependencies..."
npm install --save-dev eslint prettier eslint-plugin-react eslint-plugin-import eslint-plugin-jsx-a11y

# Step 5: Restore Cypress if it was present
if [ ! -z "$CYPRESS_VERSION" ]; then
    echo "Restoring Cypress ($CYPRESS_VERSION)..."
    # Add Cypress back to package.json but don't install it yet
    sed -i '/"devDependencies": {/a\    '"$CYPRESS_VERSION"',' package.json
    echo "Cypress restored to package.json but NOT installed to avoid errors"
    echo "You can install Cypress later with: npm install"
fi

# Step 6: Create necessary linting files
echo "Creating .eslintignore..."
cat > .eslintignore << 'EOF'
node_modules/
dist/
build/
coverage/
public/
EOF

echo "Creating .prettierignore..."
cat > .prettierignore << 'EOF'
node_modules/
dist/
build/
coverage/
public/
package-lock.json
EOF

echo "Done! Your linting setup should now be complete."
echo "If you want to restore your original package.json, run: mv package.json.backup package.json"