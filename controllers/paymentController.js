const db = require('../db');

exports.getPayments = async (req, res) => {
  try {
    const [payments] = await db.query("SELECT * FROM payments");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const [payment] = await db.query("SELECT * FROM payments WHERE payment_id = ?", [req.params.id]);
    if (payment.length === 0) return res.status(404).json({ error: "Payment not found" });
    res.json(payment[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { transaction_id, amount, payment_method, payment_status } = req.body;
    await db.query("INSERT INTO payments (transaction_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)", 
      [transaction_id, amount, payment_method, payment_status]);
    res.status(201).json({ message: "Payment created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { payment_status } = req.body;
    await db.query("UPDATE payments SET payment_status = ? WHERE payment_id = ?", 
      [payment_status, req.params.id]);
    res.json({ message: "Payment updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await db.query("DELETE FROM payments WHERE payment_id = ?", [req.params.id]);
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
