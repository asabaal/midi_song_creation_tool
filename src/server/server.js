// src/server/server.js
const app = require('./app');

// Default port is 3000 unless specified in environment
const PORT = process.env.PORT || 3000;

// Skip database connection in test mode
if (process.env.NODE_ENV !== 'test') {
  const mongoose = require('mongoose');
  
  // MongoDB connection URI (default to local development database)
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/midi_song_creation_tool';

  // Connect to MongoDB
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      startServer();
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
    });
} else {
  // In test mode, just start the server without MongoDB connection
  startServer();
}

// Start the Express server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For testing purposes
module.exports = app;