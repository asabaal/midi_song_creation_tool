#!/bin/bash
# Rollback script for MIDI Song Creation Tool
# This script will revert the changes made to fix the project structure

# Copy file for backup
backup_and_revert() {
  local file=$1
  local branch=${2:-feature/project-structure}
  local commit_before=${3:-HEAD~1}
  
  # Create backup
  cp "$file" "${file}.backup"
  echo "Created backup: ${file}.backup"
  
  # Revert to original
  git checkout "$commit_before" -- "$file"
  echo "Reverted $file to $commit_before version"
}

# Revert changes
backup_and_revert "src/server/models/session.js" "feature/project-structure" "HEAD~1"

echo "Rollback complete. Original files are in .backup files."
