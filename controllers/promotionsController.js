const prisma = require('../prismaClient');

exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({ where: { id: Number(req.params.id) } });
    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const { product_id, type } = req.body;
    await prisma.promotion.create({ data: { product_id, type } });
    res.status(201).json({ message: 'Promotion created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { product_id, type } = req.body;
    await prisma.promotion.update({ where: { id: Number(req.params.id) }, data: { product_id, type } });
    res.json({ message: 'Promotion updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    await prisma.promotion.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
