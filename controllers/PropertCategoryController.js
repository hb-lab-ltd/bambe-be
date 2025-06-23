const db = require('../db');

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM property_categories");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const [category] = await db.query("SELECT * FROM property_categories WHERE category_id = ?", [req.params.id]);
    if (category.length === 0) return res.status(404).json({ error: "Category not found" });
    res.json(category[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    await db.query("INSERT INTO property_categories (category_name) VALUES (?)", [category_name]);
    res.status(201).json({ message: "Category created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    await db.query("UPDATE property_categories SET category_name = ? WHERE category_id = ?", [category_name, req.params.id]);
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await db.query("DELETE FROM property_categories WHERE category_id = ?", [req.params.id]);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
