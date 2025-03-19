#!/bin/bash
# Rollback script for session handling fix

# Rollback to the commit before the session ID handling fix
git reset --hard 88fd0d426cd7913daf04790d7f77ac0ade5257fc

echo "Rolled back to the commit before the session ID handling fix"
echo "If you need to pull the latest version again, run: git pull origin feature/project-structure"
