const prisma = require('../prismaClient');

exports.getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { payment_id: Number(req.params.id) } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { transaction_id, amount, payment_method, payment_status } = req.body;
    await prisma.payment.create({ data: { transaction_id, amount, payment_method, payment_status } });
    res.status(201).json({ message: 'Payment created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { payment_status } = req.body;
    await prisma.payment.update({ where: { payment_id: Number(req.params.id) }, data: { payment_status } });
    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await prisma.payment.delete({ where: { payment_id: Number(req.params.id) } });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
