const prisma = require('../prismaClient');

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany();
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({ where: { id: Number(req.params.id) } });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSubscription = async (req, res) => {
  const { user_id, start_date, end_date, status } = req.body;
  try {
    const subscription = await prisma.subscription.create({ data: { user_id, start_date: new Date(start_date), end_date: new Date(end_date), status } });
    res.status(201).json({ id: subscription.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  const { user_id, start_date, end_date, status } = req.body;
  try {
    await prisma.subscription.update({ where: { id: Number(req.params.id) }, data: { user_id, start_date: new Date(start_date), end_date: new Date(end_date), status } });
    res.json({ message: 'Subscription updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    await prisma.subscription.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
