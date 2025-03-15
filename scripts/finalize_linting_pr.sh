#!/bin/bash
# Script to finalize linting PR by focusing only on linting configurations

echo -e "\n\033[1;36m==== FINALIZING LINTING PR ====\033[0m"

# 1. First fix package.json 
echo -e "\033[1;34mi Fixing package.json...\033[0m"
chmod +x scripts/fix_package_json.sh
./scripts/fix_package_json.sh

# 2. Clean up files
echo -e "\033[1;34mi Cleaning up temporary files...\033[0m"
rm -f linting_issues.txt fixed_linting_issues.txt final_linting_check.txt
rm -rf node_modules

# 3. Reset all source files to keep only linting configuration changes
echo -e "\033[1;34mi Resetting source files to focus on linting config only...\033[0m"
git checkout -- src/
git checkout -- tests/
git checkout -- docs/
git checkout -- .github/
git checkout -- *.md
git checkout -- *.js
git checkout -- cypress.config.js
git checkout -- babel.config.js
git checkout -- jest.config.js

# 4. Stage only linting configuration files
echo -e "\033[1;34mi Staging linting configuration files...\033[0m"
git add .eslintrc.js .prettierrc .eslintignore .prettierignore
git add package.json

# 5. Stage husky if we want to include it
if [ -d ".husky" ]; then
  echo -e "\033[1;33m! Husky directory found. Do you want to include pre-commit hooks in this PR? (y/n)\033[0m"
  read -p "" include_husky
  
  if [[ $include_husky == "y" || $include_husky == "Y" ]]; then
    echo -e "\033[1;34mi Adding Husky configuration to staged files...\033[0m"
    git add .husky/
  else
    echo -e "\033[1;34mi Removing Husky directory...\033[0m"
    rm -rf .husky/
  fi
fi

# 6. Add LINTING.md documentation
if [ -f "LINTING.md" ]; then
  echo -e "\033[1;34mi Adding LINTING.md to staged files...\033[0m"
  git add LINTING.md
fi

# 7. Verify what's staged
echo -e "\n\033[1;36m==== FILES READY FOR COMMIT ====\033[0m"
git status

echo -e "\n\033[1;32m✓ PR preparation complete!\033[0m"
echo -e "\033[1;34mi Ready to commit? Run: git commit -m \"Add linting configuration\"\033[0m"
echo -e "\033[1;34mi Then push to remote: git push origin feature/linting-only\033[0m"
