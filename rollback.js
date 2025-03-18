// rollback.js - Script to revert changes if needed
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the last N commits
function getLastCommits(n = 5) {
  const result = execSync('git log -n ' + n + ' --pretty=format:"%h|%s"').toString();
  return result.split('\n').map(line => {
    const [hash, message] = line.split('|');
    return { hash, message };
  });
}

// Rollback to a specific commit
function rollbackToCommit(hash) {
  console.log(`Rolling back to commit ${hash}...`);
  try {
    execSync(`git reset --hard ${hash}`);
    console.log(`Successfully rolled back to commit ${hash}`);
  } catch (error) {
    console.error(`Error rolling back: ${error.message}`);
  }
}

// Create a backup branch before rolling back
function createBackupBranch() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `backup-${timestamp}`;
  
  try {
    execSync(`git checkout -b ${branchName}`);
    console.log(`Created backup branch: ${branchName}`);
    return branchName;
  } catch (error) {
    console.error(`Error creating backup branch: ${error.message}`);
    return null;
  }
}

// Main function to run the rollback
function main() {
  console.log('MIDI Song Creation Tool - Rollback Utility');
  console.log('==========================================');
  console.log('This utility will help you roll back to a previous commit if something is broken.');
  console.log('Recent commits:');
  
  const commits = getLastCommits(10);
  commits.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.hash} - ${commit.message}`);
  });
  
  console.log('\nTo rollback to a specific commit, run:');
  console.log('  node rollback.js [commit-hash]');
  console.log('\nExample:');
  console.log(`  node rollback.js ${commits[2].hash}`);
  
  // If commit hash is provided, perform the rollback
  if (process.argv.length >= 3) {
    const commitHash = process.argv[2];
    
    // First, create a backup branch
    const backupBranch = createBackupBranch();
    if (!backupBranch) {
      console.error('Could not create backup branch. Aborted rollback.');
      return;
    }
    
    // Check out the original branch
    try {
      execSync('git checkout feature/project-structure');
      
      // Do the rollback
      rollbackToCommit(commitHash);
      
      console.log('\nRollback completed successfully!');
      console.log(`Original state was saved in branch: ${backupBranch}`);
      console.log('\nTo restore the backup branch, run:');
      console.log(`  git checkout ${backupBranch}`);
    } catch (error) {
      console.error(`Error during rollback: ${error.message}`);
    }
  }
}

// Run the script
main();
