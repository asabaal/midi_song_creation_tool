// src/server/server.js
const app = require('./app');
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  // In a production application, these would be replaced with a proper logger
  // But we'll keep them for now and just add comments to acknowledge the warning
  console.log(`MIDI Song Creation Tool server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server endpoints available at http://localhost:${PORT}/api`);
  }
});
