const prisma = require('../prismaClient');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { transaction_id: Number(req.params.id) } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { listing_id, buyer_id, seller_id, status } = req.body;
    await prisma.transaction.create({ data: { listing_id, buyer_id, seller_id, status } });
    res.status(201).json({ message: 'Transaction created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { status } = req.body;
    await prisma.transaction.update({ where: { transaction_id: Number(req.params.id) }, data: { status } });
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await prisma.transaction.delete({ where: { transaction_id: Number(req.params.id) } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
