const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all services
router.get('/', (req, res) => {
  db.all('SELECT * FROM services ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get service with employees
router.get('/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM services WHERE id = ?', [id], (err, service) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Get employees providing this service
    db.all(
      `SELECT e.* FROM employees e
       JOIN employee_services es ON e.id = es.employee_id
       WHERE es.service_id = ?`,
      [id],
      (err, employees) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        service.employees = employees;
        res.json(service);
      }
    );
  });
});

// Add new service
router.post('/', (req, res) => {
  const { name, icon, is_shared } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Service name is required' });
    return;
  }

  db.run(
    'INSERT INTO services (name, icon, is_shared) VALUES (?, ?, ?)',
    [name, icon || '📋', is_shared ? 1 : 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID, 
        name, 
        icon: icon || '📋',
        is_shared: is_shared ? 1 : 0
      });
    }
  );
});

// Assign service to employee
router.post('/:id/assign', (req, res) => {
  const { employee_id } = req.body;
  const service_id = req.params.id;
  
  if (!employee_id) {
    res.status(400).json({ error: 'Employee ID is required' });
    return;
  }

  db.run(
    'INSERT OR IGNORE INTO employee_services (employee_id, service_id) VALUES (?, ?)',
    [employee_id, service_id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Service assigned to employee' });
    }
  );
});

// Remove service from employee
router.delete('/:id/unassign/:employee_id', (req, res) => {
  const { id, employee_id } = req.params;
  
  db.run(
    'DELETE FROM employee_services WHERE service_id = ? AND employee_id = ?',
    [id, employee_id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Service removed from employee' });
    }
  );
});

module.exports = router;
