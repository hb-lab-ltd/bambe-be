const pool = require('../db');

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Categories (name) VALUES (?)',
      [name]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query(
      'UPDATE Categories SET name = ? WHERE id = ?',
      [name, req.params.id]
    );
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM Categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
