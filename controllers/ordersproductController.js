const prisma = require('../prismaClient');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.ordersProduct.findMany({
      include: {
        product: { include: { images: true } }
      }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { customer_details, order_items } = req.body;
  const { first_name, last_name, email, phone_number, address_line, city, state, zip_code } = customer_details;
  try {
    const data = order_items.map(item => ({
      first_name,
      last_name,
      email,
      phone_number,
      address_line,
      city,
      state,
      zip_code,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      order_status: 'Pending',
      created_at: new Date(),
      updated_at: new Date()
    }));
    await prisma.ordersProduct.createMany({ data });
    res.json({ message: 'Product order successfully placed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};













// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.ordersProduct.findUnique({
      where: { id: parseInt(req.params.id, 10) }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  const { first_name, last_name, email, phone_number, address_line, city, state, zip_code, product_id, quantity, price, total, order_status } = req.body;
  try {
    const order = await prisma.ordersProduct.update({
      where: { id: parseInt(req.params.id, 10) },
      data: {
        first_name,
        last_name,
        email,
        phone_number,
        address_line,
        city,
        state,
        zip_code,
        product_id,
        quantity,
        price,
        total,
        order_status,
        updated_at: new Date()
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const order = await prisma.ordersProduct.delete({
      where: { id: parseInt(req.params.id, 10) }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
