const db = require('../db');

exports.getTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query("SELECT * FROM transactions");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const [transaction] = await db.query("SELECT * FROM transactions WHERE transaction_id = ?", [req.params.id]);
    if (transaction.length === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json(transaction[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { listing_id, buyer_id, seller_id, status } = req.body;
    await db.query("INSERT INTO transactions (listing_id, buyer_id, seller_id, status) VALUES (?, ?, ?, ?)", 
      [listing_id, buyer_id, seller_id, status]);
    res.status(201).json({ message: "Transaction created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query("UPDATE transactions SET status = ? WHERE transaction_id = ?", 
      [status, req.params.id]);
    res.json({ message: "Transaction updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await db.query("DELETE FROM transactions WHERE transaction_id = ?", [req.params.id]);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
