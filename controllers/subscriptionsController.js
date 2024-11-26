const pool = require('../db');

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Subscriptions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new subscription
exports.createSubscription = async (req, res) => {
  const { user_id, start_date, end_date, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Subscriptions (user_id, start_date, end_date, status) VALUES (?, ?, ?, ?)',
      [user_id, start_date, end_date, status || 'inactive']
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single subscription
exports.getSubscriptionById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Subscriptions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
  const { start_date, end_date, status } = req.body;
  try {
    await pool.query(
      'UPDATE Subscriptions SET start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [start_date, end_date, status, req.params.id]
    );
    res.json({ message: 'Subscription updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  try {
    await pool.query('DELETE FROM Subscriptions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
