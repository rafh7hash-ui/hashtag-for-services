const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/employees', require('./routes/employees'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/whatsapp', require('./routes/whatsapp'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🏷️ Hashtag For Services is running!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
});
