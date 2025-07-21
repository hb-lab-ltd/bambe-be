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

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'UMUHUZA Contact Form Submission',
      text: `Dear ${name},\n\nThank you for contacting UMUHUZA. We have received your message and will get back to you soon.`,
      html: `<p>Dear ${name},</p><p>Thank you for contacting UMUHUZA. We have received your message and will get back to you soon.</p>`
    });
    // Send contact info and message to umuhuza.store@gmail.com
    await sendEmail({
      to: 'umuhuza.store@gmail.com',
      subject: 'New Contact Form Submission',
      text: `Contact Information:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      html: `<p><b>Contact Information:</b></p><ul><li>Name: ${name}</li><li>Email: ${email}</li><li>Phone: ${phone}</li></ul><p><b>Message:</b></p><p>${message}</p>`
    });
    res.status(200).json({ message: 'Contact form submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 