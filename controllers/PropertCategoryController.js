const prisma = require('../prismaClient');

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.propertyCategory.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await prisma.propertyCategory.findUnique({ where: { category_id: Number(req.params.id) } });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    await prisma.propertyCategory.create({ data: { category_name } });
    res.status(201).json({ message: 'Category created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    await prisma.propertyCategory.update({ where: { category_id: Number(req.params.id) }, data: { category_name } });
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await prisma.propertyCategory.delete({ where: { category_id: Number(req.params.id) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
