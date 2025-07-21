const prisma = require('../prismaClient');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({ data: { name } });
    res.json({ id: category.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: Number(req.params.id) } });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  try {
    await prisma.category.update({ where: { id: Number(req.params.id) }, data: { name } });
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
