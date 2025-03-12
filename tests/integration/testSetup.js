// tests/integration/testSetup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createMockApiServer = require('./api/apiMockSetup');

let mongoServer;
let app;

// Setup MongoDB Memory Server and API server before all tests
beforeAll(async () => {
  // Create mock API server - this must be initialized before any tests run
  app = await createMockApiServer();
  
  // Setup MongoDB in memory server for tests that need it
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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