const pool = require('../db');

exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
      return res.status(400).json({ message: 'User ID is missing from token' });
  }
  const {name, description, price, category_id, is_new, is_best_seller, is_on_promotion } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Products (user_id, name, description, price, category_id, is_new, is_best_seller, is_on_promotion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, description, price, category_id || null, is_new || false, is_best_seller || false, is_on_promotion || false]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { user_id, name, description, price, category_id, is_new, is_best_seller, is_on_promotion } = req.body;
  try {
    await pool.query(
      `UPDATE Products SET user_id = ?, name = ?, description = ?, price = ?, category_id = ?, is_new = ?, is_best_seller = ?, is_on_promotion = ? 
       WHERE id = ?`,
      [user_id, name, description, price, category_id || null, is_new || false, is_best_seller || false, is_on_promotion || false, req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
