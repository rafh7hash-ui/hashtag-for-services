const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Routes
app.use('/api/employees', require('./routes/employees'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/whatsapp-connect', require('./routes/whatsapp-connect'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🏷️ Hashtag For Services is running!' });
});

// WhatsApp Dashboard
app.get('/whatsapp-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/whatsapp-dashboard.html'));
});

// Home page redirect
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
  console.log(`📱 WhatsApp Dashboard: http://localhost:${PORT}/whatsapp-dashboard`);
});
