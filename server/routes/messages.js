const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all message templates
router.get('/', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add message template
router.post('/', (req, res) => {
  const { type, content } = req.body;
  
  if (!type || !content) {
    res.status(400).json({ error: 'Type and content are required' });
    return;
  }

  db.run(
    'INSERT INTO messages (type, content) VALUES (?, ?)',
    [type, content],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, type, content });
    }
  );
});

// Update message template
router.put('/:id', (req, res) => {
  const { type, content } = req.body;
  const id = req.params.id;

  db.run(
    'UPDATE messages SET type = ?, content = ? WHERE id = ?',
    [type, content, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Message updated successfully' });
    }
  );
});

// Delete message template
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM messages WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Message deleted successfully' });
  });
});

module.exports = router;
