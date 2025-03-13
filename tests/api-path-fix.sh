#!/bin/bash

# Script to fix the API endpoint issues in music theory routes

# Check the route handling for sharp notes in musicTheoryRoutes.js
if [ -f "src/server/routes/musicTheoryRoutes.js" ]; then
  # Create backup of original file
  cp src/server/routes/musicTheoryRoutes.js src/server/routes/musicTheoryRoutes.js.bak
  
  # Add modified version that handles URL encoding properly
  sed -i 's/root = decodeURIComponent(root); \/\/ This will convert %23 to #/root = decodeURIComponent(root.replace(/\\+/g, "%20")); \/\/ Handle both %23 and + encoding/' src/server/routes/musicTheoryRoutes.js
  
  echo "Updated musicTheoryRoutes.js to better handle URL encoding"
fi

# Ensure there's a proper test setup for the API tests
mkdir -p tests/integration

# Create integration test setup file if it doesn't exist
if [ ! -f "tests/integration/testSetup.js" ]; then
  cat > tests/integration/testSetup.js << 'EOL'
// Test setup for integration tests
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes directly
let musicTheoryRoutes;
try {
  musicTheoryRoutes = require('../../src/server/routes/musicTheoryRoutes');
} catch (error) {
  console.warn('Music theory routes not found:', error.message);
  // Create a stub if needed
  musicTheoryRoutes = express.Router();
}

// Create mock app for testing
const createMockApp = () => {
  const app = express();
  
  // Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Enable special character handling in URLs
  app.set('strict routing', false);
  app.enable('case sensitive routing');
  
  // Register API routes
  app.use('/api/music-theory', musicTheoryRoutes);
  
  // Error handling middleware
  app.use((err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Server error',
      message: err.message,
    });
  });
  
  return app;
};

// Create mock app instance
const mockApp = createMockApp();

module.exports = {
  createMockApp,
  mockApp,
};
EOL

  echo "Created testSetup.js for API integration tests"
fi

echo "Fixed API path issues for music theory endpoints"
