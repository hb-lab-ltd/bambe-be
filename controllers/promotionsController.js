const pool = require('../db');

// Get all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Promotions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new promotion
exports.createPromotion = async (req, res) => {
  const { product_id, type } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Promotions (product_id, type) VALUES (?, ?)',
      [product_id, type]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single promotion
exports.getPromotionById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Promotions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a promotion
exports.updatePromotion = async (req, res) => {
  const { product_id, type } = req.body;
  try {
    await pool.query(
      'UPDATE Promotions SET product_id = ?, type = ? WHERE id = ?',
      [product_id, type, req.params.id]
    );
    res.json({ message: 'Promotion updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a promotion
exports.deletePromotion = async (req, res) => {
  try {
    await pool.query('DELETE FROM Promotions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
