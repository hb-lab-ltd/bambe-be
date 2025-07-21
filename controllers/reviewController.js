const prisma = require('../prismaClient');

exports.getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { review_id: Number(req.params.id) } });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { listing_id, user_id, rating, comment } = req.body;
    await prisma.review.create({ data: { listing_id, user_id, rating, comment } });
    res.status(201).json({ message: 'Review created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    await prisma.review.update({ where: { review_id: Number(req.params.id) }, data: { rating, comment } });
    res.json({ message: 'Review updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await prisma.review.delete({ where: { review_id: Number(req.params.id) } });
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
