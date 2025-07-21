const prisma = require('../prismaClient');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password_hash, role, subscription_status } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        role: role || 'seller',
        subscription_status: subscription_status || 'inactive',
      },
    });
    res.json({ id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single user
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { username, email, password_hash, role, subscription_status } = req.body;
  try {
    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { username, email, password_hash, role, subscription_status },
    });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
