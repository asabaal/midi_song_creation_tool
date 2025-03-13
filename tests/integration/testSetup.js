// tests/integration/testSetup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiMockSetup = require('./api/apiMockSetup');

let mongoServer;
let app;
let server;

// Setup MongoDB Memory Server and API server before all tests
beforeAll(async () => {
  // Create Express app for testing
  app = express();
  
  // Configure middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Start the server on a random port
  server = app.listen();
  
  // Setup MongoDB in memory server for tests that need it
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
  
  return app;
});

// Clean up after all tests
afterAll(async () => {
  // Close Express server if it's running
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
  
  // Disconnect from mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clear all collections after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// For API tests that use the mock API directly
const mockApp = apiMockSetup();

// Export app instance for supertest to use
module.exports = { mongoose, MongoMemoryServer, app, mockApp };
