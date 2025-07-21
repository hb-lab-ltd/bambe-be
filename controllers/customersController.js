const prisma = require('../prismaClient');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { user_id, name, email, phone } = req.body;
  try {
    const customer = await prisma.customer.create({ data: { user_id, name, email, phone } });
    res.json({ id: customer.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: Number(req.params.id) } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { user_id, name, email, phone } = req.body;
  try {
    await prisma.customer.update({ where: { id: Number(req.params.id) }, data: { user_id, name, email, phone } });
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
