const db = require('../db');

exports.getReviews = async (req, res) => {
  try {
    const [reviews] = await db.query("SELECT * FROM reviews");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const [review] = await db.query("SELECT * FROM reviews WHERE review_id = ?", [req.params.id]);
    if (review.length === 0) return res.status(404).json({ error: "Review not found" });
    res.json(review[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { listing_id, user_id, rating, comment } = req.body;
    await db.query("INSERT INTO reviews (listing_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", 
      [listing_id, user_id, rating, comment]);
    res.status(201).json({ message: "Review created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    await db.query("UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?", 
      [rating, comment, req.params.id]);
    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await db.query("DELETE FROM reviews WHERE review_id = ?", [req.params.id]);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
