// tests/integration/testSetup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createMockApiServer = require('./api/apiMockSetup');
const http = require('http');

let mongoServer;
let app;
let server;

// Setup MongoDB Memory Server and API server before all tests
beforeAll(async () => {
  // Create mock API server - this must be initialized before any tests run
  app = createMockApiServer();
  
  // Start the server explicitly for SuperTest
  server = http.createServer(app);
  server.listen(0); // Use random port
  
  // Add the server to the app for cleanup
  app.server = server;
  
  // Setup MongoDB in memory server for tests that need it
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  const mongooseOpts = {
    // Remove deprecated options
    // useNewUrlParser and useUnifiedTopology are default in Mongoose 6+
  };

  await mongoose.connect(uri, mongooseOpts);
  
  return app;
});

// Clean up after all tests
afterAll(async () => {
  // Close Express server if it's running
  if (app && app.server) {
    await new Promise(resolve => app.server.close(resolve));
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

// Export app instance for supertest to use
module.exports = { mongoose, MongoMemoryServer, app };
