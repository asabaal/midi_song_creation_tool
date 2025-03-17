// src/server/server.js
const app = require('./app');
const PORT = process.env.PORT || 3003;

// Start the server
app.listen(PORT, () => {
  // In a production application, these would be replaced with a proper logger
  // But we'll keep them for now and just add comments to acknowledge the warning
  // eslint-disable-next-line no-console
  console.log(`====================================================`);
  console.log(`MIDI Song Creation Tool API`);
  console.log(`Running on port ${PORT}`);
  console.log(`Web interface available at http://localhost:${PORT}`);
  console.log(`====================================================`);

  // eslint-disable-next-line no-console
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  }
});
