const prisma = require('../prismaClient');

exports.getAllProductImages = async (req, res) => {
  try {
    const images = await prisma.productImage.findMany();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductImageById = async (req, res) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: Number(req.params.id) } });
    if (!image) return res.status(404).json({ error: 'Product image not found' });
    res.json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProductImage = async (req, res) => {
  const { product_id, image_url, is_primary } = req.body;
  try {
    const image = await prisma.productImage.create({ data: { product_id, image_url, is_primary } });
    res.status(201).json({ id: image.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProductImage = async (req, res) => {
  const { product_id, image_url, is_primary } = req.body;
  try {
    await prisma.productImage.update({ where: { id: Number(req.params.id) }, data: { product_id, image_url, is_primary } });
    res.json({ message: 'Product image updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    await prisma.productImage.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Product image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
