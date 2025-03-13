const fs = require('fs');
const results = JSON.parse(fs.readFileSync('./test-deep-dive/test-results.json', 'utf8'));
const testResults = results.testResults.flatMap(suite => suite.testResults);

// Find skipped tests
const skippedTests = testResults.filter(test => test.status === 'pending');

// Print details about skipped tests
console.log('=== SKIPPED TESTS DETAILS ===');
skippedTests.forEach((test, index) => {
  console.log(`Skipped Test #${index + 1}:`);
  console.log(`  Full Title: ${test.fullName}`);
  console.log(`  Ancestor Titles: ${JSON.stringify(test.ancestorTitles)}`);
  console.log(`  Title: ${test.title}`);
  console.log(`  Status: ${test.status}`);
  console.log(`  Duration: ${test.duration}ms`);
  if (test.failureMessages && test.failureMessages.length > 0) {
    console.log(`  Failure: ${test.failureMessages[0]}`);
  }
  console.log('---');
});

// Find test files containing the skipped tests
const skippedTestTitles = skippedTests.map(test => test.title);
const skippedTestFiles = new Set();
const suiteDetails = [];

results.testResults.forEach(suite => {
  // Check if this suite contains any of the skipped tests
  const containsSkippedTest = suite.testResults.some(test => 
    test.status === 'pending' && skippedTestTitles.includes(test.title)
  );
  
  if (containsSkippedTest) {
    skippedTestFiles.add(suite.name);
    
    suiteDetails.push({
      file: suite.name,
      skippedTests: suite.testResults
        .filter(test => test.status === 'pending')
        .map(test => ({
          title: test.title,
          ancestorTitles: test.ancestorTitles
        }))
    });
  }
});

console.log('=== FILES CONTAINING SKIPPED TESTS ===');
suiteDetails.forEach(suite => {
  console.log(`File: ${suite.file}`);
  console.log('Skipped Tests:');
  suite.skippedTests.forEach(test => {
    console.log(`  - ${test.ancestorTitles.join(' > ')} > ${test.title}`);
  });
  console.log('---');
});

