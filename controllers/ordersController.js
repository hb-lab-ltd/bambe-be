const pool = require('../db');

exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Orders');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { product_id, customer_id, quantity, total_price } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Orders (product_id, customer_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [product_id, customer_id, quantity, total_price]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const { product_id, customer_id, quantity, total_price } = req.body;
  try {
    await pool.query(
      'UPDATE Orders SET product_id = ?, customer_id = ?, quantity = ?, total_price = ? WHERE id = ?',
      [product_id, customer_id, quantity, total_price, req.params.id]
    );
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await pool.query('DELETE FROM Orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
