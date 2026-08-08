const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../database');

// Get WhatsApp configuration
router.get('/config', (req, res) => {
  const config = {
    phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    access_token: process.env.WHATSAPP_ACCESS_TOKEN ? '***' : '',
    webhook_url: process.env.WEBHOOK_URL || ''
  };
  res.json(config);
});

// Send message via WhatsApp
router.post('/send', (req, res) => {
  const { to, message } = req.body;
  
  if (!to || !message) {
    res.status(400).json({ error: 'Phone number and message are required' });
    return;
  }

  // This is a placeholder - implement actual WhatsApp API integration
  console.log(`📱 Sending WhatsApp message to ${to}:`, message);
  
  res.json({ 
    success: true, 
    message: 'Message queued for sending',
    to,
    text: message
  });
});

// Webhook for incoming messages
router.post('/webhook', (req, res) => {
  const { entry } = req.body;
  
  if (entry) {
    entry.forEach((e) => {
      const changes = e.changes;
      changes.forEach((change) => {
        const value = change.value;
        const messages = value.messages;
        
        if (messages) {
          messages.forEach((message) => {
            console.log('📥 Incoming message:', message);
            // Handle incoming message
          });
        }
      });
    });
  }
  
  res.json({ status: 'received' });
});

module.exports = router;
