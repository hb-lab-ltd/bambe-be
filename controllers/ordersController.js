const prisma = require('../prismaClient');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { product_id, customer_id, quantity, total_price } = req.body;
  try {
    const order = await prisma.order.create({ data: { product_id, customer_id, quantity, total_price } });
    res.json({ id: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const { product_id, customer_id, quantity, total_price } = req.body;
  try {
    await prisma.order.update({ where: { id: Number(req.params.id) }, data: { product_id, customer_id, quantity, total_price } });
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
