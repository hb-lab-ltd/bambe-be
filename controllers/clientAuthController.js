const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Utility function to send email
async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}

// Register client from inquiry
exports.registerFromInquiry = async (req, res) => {
  try {
    const { inquiry_id, name, email, phone, password } = req.body;
    // Check if client already exists
    const existingClient = await prisma.customer.findFirst({ where: { email } });
    if (existingClient) {
      return res.status(400).json({ error: 'Client with this email already exists. Please login instead.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Find a default admin user to use as user_id
    let adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    let defaultUserId = adminUser ? adminUser.id : 56;
    // Create client with a valid user_id
    const client = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        status: 'active',
        user_id: defaultUserId
      }
    });
    const clientId = client.id;
    // Update inquiry to link with client (only if inquiry_id is provided)
    if (inquiry_id) {
      try {
        await prisma.inquiry.update({
          where: { id: inquiry_id },
          data: { client_id: clientId }
        });
      } catch (updateError) {
        // Don't fail the registration if inquiry update fails
      }
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: clientId,
        email,
        name,
        role: 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Send welcome email
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Welcome to UMUHUZA!',
        text: `Dear ${name},\n\nYour account has been created successfully. You can now log in to your account.`,
        html: `<p>Dear ${name},</p><p>Your account has been created successfully. You can now log in to your account.</p>`
      });
    }
    res.json({ token, client: { id: clientId, email, name, role: 'client' } });
  } catch (err) {
    res.status(500).json({ error: err.message, prisma: err.meta || undefined });
  }
};

// Login client
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const client = await prisma.customer.findFirst({ where: { email } });
    if (!client || !(await bcrypt.compare(password, client.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      {
        id: client.id,
        email: client.email,
        name: client.name,
        role: 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, client: { id: client.id, email: client.email, name: client.name, role: 'client' } });
  } catch (err) {
    res.status(500).json({ error: err.message, prisma: err.meta || undefined });
  }
};

// Get client profile
exports.getClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;
    const client = await prisma.customer.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true, phone: true, status: true, created_at: true }
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update client profile
exports.updateClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { name, phone } = req.body;
    await prisma.customer.update({
      where: { id: clientId },
      data: { name, phone }
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change client password
exports.changePassword = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const client = await prisma.customer.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const isValidPassword = await bcrypt.compare(currentPassword, client.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { id: clientId },
      data: { password: hashedNewPassword }
    });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send password reset email (simplified - just generate reset token)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const client = await prisma.customer.findFirst({ where: { email } });
    if (!client) {
      return res.status(404).json({ error: 'No account found with this email' });
    }
    // Generate reset token
    const resetToken = jwt.sign(
      { id: client.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' } // Token expires in 5 minutes
    );
    // Send password reset email with clickable link
    const resetUrl = `https://umuhuzaonline.com/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'UMUHUZA ONLINE Password Reset',
      text: `Dear ${client.name || 'User'},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 5 minutes and can only be used once.\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Dear ${client.name || 'User'},</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <p><a href="${resetUrl}" style="color: #38B496;">Reset your password</a></p>
             <p><b>This link will expire in 5 minutes and can only be used once.</b></p>
             <p>If you did not request this, please ignore this email.</p>`
    });
    res.json({ message: 'Password reset instructions sent to your email', resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message, prisma: error.meta || undefined });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clientId = decoded.id;
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { id: clientId },
      data: { password: hashedNewPassword }
    });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}; 