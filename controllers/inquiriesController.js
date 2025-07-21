const prisma = require('../prismaClient');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      include: {
        property: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiriesByAgent = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { property: { user_id: user_id } },
      include: { property: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiriesByClient = async (req, res) => {
  const clientId = req.user?.id;
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [
          { client_id: clientId },
          { email: (await prisma.customer.findUnique({ where: { id: clientId } }))?.email || '' }
        ]
      },
      include: { property: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.createInquiry = async (req, res) => {
  const { name, email, phone, message, property_id } = req.body;
  const clientId = req.user?.id;
  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        message,
        property_id,
        status: 'new',
        priority: 'medium',
        client_id: clientId || null
      }
    });

    // Send email to admin
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'New Inquiry Received',
      text: `A new inquiry was submitted by ${name} (${email}, ${phone}):\n${message}`,
      html: `<p>A new inquiry was submitted by <b>${name}</b> (${email}, ${phone}):</p><p>${message}</p>`
    });

    // Send confirmation email to user (if email provided)
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Thank you for your inquiry',
        text: `Dear ${name},\n\nThank you for your inquiry. We have received your message and will get back to you soon.`,
        html: `<p>Dear ${name},</p><p>Thank you for your inquiry. We have received your message and will get back to you soon.</p>`
      });
    }

    res.status(201).json({ id: inquiry.id, message: 'Inquiry created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: Number(req.params.id) } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiryByIdForClient = async (req, res) => {
  const clientId = req.user?.id;
  try {
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: Number(req.params.id),
        OR: [
          { client_id: clientId },
          { email: (await prisma.customer.findUnique({ where: { id: clientId } }))?.email || '' }
        ]
      },
      include: { property: true }
    });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  const { status, priority, notes } = req.body;
  try {
    await prisma.inquiry.update({ where: { id: Number(req.params.id) }, data: { status, priority, notes } });
    res.json({ message: 'Inquiry updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToInquiry = async (req, res) => {
  const { reply_message } = req.body;
  try {
    await prisma.inquiry.update({ where: { id: Number(req.params.id) }, data: { status: 'replied', replied_at: new Date(), reply_message } });
    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Client reply to agent's reply
exports.clientReplyToInquiry = async (req, res) => {
  const { client_message } = req.body;
  const clientId = req.user?.id;
  try {
    // First verify the inquiry belongs to this client
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: Number(req.params.id),
        OR: [
          { client_id: clientId },
          { email: (await prisma.customer.findUnique({ where: { id: clientId } }))?.email || '' }
        ]
      }
    });
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Update the inquiry with client's reply
    await prisma.inquiry.update({
      where: { id: Number(req.params.id) },
      data: { status: 'client_replied', client_reply: client_message, client_replied_at: new Date() }
    });
    
    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    await prisma.inquiry.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiryStats = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { property: { user_id: user_id } },
      include: { property: true }
    });
    const totalInquiries = inquiries.length;
    const newInquiries = inquiries.filter(i => i.status === 'new').length;
    const repliedInquiries = inquiries.filter(i => i.status === 'replied').length;
    const closedInquiries = inquiries.filter(i => i.status === 'closed').length;
    const highPriority = inquiries.filter(i => i.priority === 'high').length;
    const mediumPriority = inquiries.filter(i => i.priority === 'medium').length;
    const lowPriority = inquiries.filter(i => i.priority === 'low').length;

    res.json({
      total_inquiries: totalInquiries,
      new_inquiries: newInquiries,
      replied_inquiries: repliedInquiries,
      closed_inquiries: closedInquiries,
      high_priority: highPriority,
      medium_priority: mediumPriority,
      low_priority: lowPriority
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inquiry stats for client
exports.getClientInquiryStats = async (req, res) => {
  const clientId = req.user?.id;
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [
          { client_id: clientId },
          { email: (await prisma.customer.findUnique({ where: { id: clientId } }))?.email || '' }
        ]
      }
    });
    const totalInquiries = inquiries.length;
    const newInquiries = inquiries.filter(i => i.status === 'new').length;
    const repliedInquiries = inquiries.filter(i => i.status === 'replied').length;
    const clientRepliedInquiries = inquiries.filter(i => i.status === 'client_replied').length;
    const closedInquiries = inquiries.filter(i => i.status === 'closed').length;

    res.json({
      total_inquiries: totalInquiries,
      new_inquiries: newInquiries,
      replied_inquiries: repliedInquiries,
      client_replied_inquiries: clientRepliedInquiries,
      closed_inquiries: closedInquiries
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 