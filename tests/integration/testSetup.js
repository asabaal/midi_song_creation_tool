// Test setup for integration tests
const express = require('express');
const bodyParser = require('body-parser');
const musicTheoryRoutes = require('../../src/server/api/musicTheory');

// Mock app for testing
const createMockApp = () => {
  const app = express();
  
  // Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
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
