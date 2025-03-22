// src/server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Get the app configuration
const app = require('./app');

// Create a debugging server wrapper
const debugServer = express();

// Add CORS and basic middleware
debugServer.use(cors());
debugServer.use(bodyParser.json({ limit: '10mb' }));

// Debug middleware to see all requests
debugServer.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  console.log(`[DEBUG] Headers:`, req.headers);
  console.log(`[DEBUG] Params:`, req.params);
  console.log(`[DEBUG] Body:`, req.body);
  
  // If we didn't handle it directly, forward to the main app
  next();
});

// Use the main app for all other routes
debugServer.use(app);

// Also add a catch-all route at the very end
debugServer.use((req, res) => {
  console.log(`[DEBUG] Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `No route found for ${req.method} ${req.url}`
  });
});

// Start the server
const PORT = process.env.PORT || 3003; // Ensure we're using port 3003 consistently
debugServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`MIDI Song Creation Tool API`);
  console.log(`Running on port ${PORT}`);
  console.log(`Web interface available at http://localhost:${PORT}`);
  console.log(`Try the debug interface at http://localhost:${PORT}/debug.html`);
  console.log(`====================================================`);
});
