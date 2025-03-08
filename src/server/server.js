// src/server/server.js
const app = require('./app');
const mongoose = require('mongoose');

// Default port is 3000 unless specified in environment
const PORT = process.env.PORT || 3000;
// MongoDB connection URI (default to local development database)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/midi_song_creation_tool';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });