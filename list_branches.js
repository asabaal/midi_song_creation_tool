// Simple script to list all branches in the repository
const { execSync } = require('child_process');

try {
  // Execute git command to list all branches
  const branches = execSync('git branch -a').toString();
  console.log('All branches in the repository:');
  console.log(branches);
} catch (error) {
  console.error('Error executing git command:', error.message);
}
