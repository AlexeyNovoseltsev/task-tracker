const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 3001;
const HOST = 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Test server running on http://${HOST}:${PORT}`);
  console.log('✅ Server is listening on port 3001');
});
