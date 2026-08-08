const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all employees
router.get('/', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get employee with services
router.get('/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, employee) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Get services for this employee
    db.all(
      `SELECT s.* FROM services s
       JOIN employee_services es ON s.id = es.service_id
       WHERE es.employee_id = ?`,
      [id],
      (err, services) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        employee.services = services;
        res.json(employee);
      }
    );
  });
});

// Add new employee
router.post('/', (req, res) => {
  const { name, phone, icon } = req.body;
  
  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  db.run(
    'INSERT INTO employees (name, phone, icon) VALUES (?, ?, ?)',
    [name, phone, icon || '👤'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, phone, icon: icon || '👤' });
    }
  );
});

// Update employee
router.put('/:id', (req, res) => {
  const { name, phone, icon } = req.body;
  const id = req.params.id;

  db.run(
    'UPDATE employees SET name = ?, phone = ?, icon = ? WHERE id = ?',
    [name, phone, icon, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Employee updated successfully' });
    }
  );
});

// Delete employee
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM employee_services WHERE employee_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Employee deleted successfully' });
    });
  });
});

module.exports = router;
