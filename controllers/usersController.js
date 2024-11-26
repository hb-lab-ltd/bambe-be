const pool = require('../db');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password_hash, role, subscription_status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Users (username, email, password_hash, role, subscription_status) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password_hash, role || 'seller', subscription_status || 'inactive']
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single user
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { username, email, password_hash, role, subscription_status } = req.body;
  try {
    await pool.query(
      `UPDATE Users SET username = ?, email = ?, password_hash = ?, role = ?, subscription_status = ? 
       WHERE id = ?`,
      [username, email, password_hash, role, subscription_status, req.params.id]
    );
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM Users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
