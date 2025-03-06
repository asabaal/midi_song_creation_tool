const express = require('express');
const app = express();

// Serve static files
app.use(express.static('public'));

// Root path handler
app.get('/', (req, res) => {
  res.send('Hello World! If you see this, Express is working correctly.');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});