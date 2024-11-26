const pool = require('../db');

exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { user_id, name, email, phone } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Customers (user_id, name, email, phone) VALUES (?, ?, ?, ?)',
      [user_id, name, email, phone]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { user_id, name, email, phone } = req.body;
  try {
    await pool.query(
      'UPDATE Customers SET user_id = ?, name = ?, email = ?, phone = ? WHERE id = ?',
      [user_id, name, email, phone, req.params.id]
    );
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await pool.query('DELETE FROM Customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
