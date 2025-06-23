const db = require("../db");

exports.getAllInquiries = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.id,
        i.name,
        i.email,
        i.phone,
        i.message,
        i.property_id,
        i.status,
        i.priority,
        i.created_at,
        i.reply_message,
        i.replied_at,
        i.client_reply,
        i.client_replied_at,
        l.title as property_name,
        l.listing_id,
        l.price as property_price,
        l.location as property_location
      FROM inquiries i
      LEFT JOIN listings l ON i.property_id = l.listing_id
      ORDER BY i.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiriesByAgent = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const query = `
      SELECT 
        i.id,
        i.name,
        i.email,
        i.phone,
        i.message,
        i.property_id,
        i.status,
        i.priority,
        i.created_at,
        i.reply_message,
        i.replied_at,
        i.client_reply,
        i.client_replied_at,
        l.title as property_name,
        l.listing_id,
        l.price as property_price,
        l.location as property_location
      FROM inquiries i
      LEFT JOIN listings l ON i.property_id = l.listing_id
      WHERE l.user_id = ?
      ORDER BY i.created_at DESC
    `;
    const [rows] = await db.query(query, [user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inquiries by client
exports.getInquiriesByClient = async (req, res) => {
  const clientId = req.user?.id;
  try {
    const query = `
      SELECT 
        i.id,
        i.name,
        i.email,
        i.phone,
        i.message,
        i.property_id,
        i.status,
        i.priority,
        i.created_at,
        i.reply_message,
        i.replied_at,
        l.title as property_name,
        l.listing_id,
        l.price,
        l.location
      FROM inquiries i
      LEFT JOIN listings l ON i.property_id = l.listing_id
      WHERE i.client_id = ? OR i.email = (SELECT email FROM customers WHERE id = ?)
      ORDER BY i.created_at DESC
    `;
    const [rows] = await db.query(query, [clientId, clientId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createInquiry = async (req, res) => {
  const { name, email, phone, message, property_id } = req.body;
  const clientId = req.user?.id;
  
  try {
    const [result] = await db.query(
      'INSERT INTO inquiries (name, email, phone, message, property_id, status, priority, client_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, message, property_id, 'new', 'medium', clientId || null]
    );
    res.status(201).json({ id: result.insertId, message: "Inquiry created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inquiry by ID for client (with property details)
exports.getInquiryByIdForClient = async (req, res) => {
  const clientId = req.user?.id;
  console.log('Client inquiry request:', { clientId, inquiryId: req.params.id, user: req.user });
  
  try {
    const query = `
      SELECT 
        i.*,
        l.title as property_name,
        l.listing_id,
        l.price,
        l.location,
        l.description
      FROM inquiries i
      LEFT JOIN listings l ON i.property_id = l.listing_id
      WHERE i.id = ? AND (i.client_id = ? OR i.email = (SELECT email FROM customers WHERE id = ?))
    `;
    
    console.log('Executing query with params:', [req.params.id, clientId, clientId]);
    const [rows] = await db.query(query, [req.params.id, clientId, clientId]);
    console.log('Query result:', rows);
    
    if (rows.length === 0) {
      console.log('No inquiry found for client');
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    console.log('Returning inquiry:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in getInquiryByIdForClient:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  const { status, priority, notes } = req.body;
  try {
    await db.query(
      'UPDATE inquiries SET status = ?, priority = ?, notes = ? WHERE id = ?',
      [status, priority, notes, req.params.id]
    );
    res.json({ message: 'Inquiry updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToInquiry = async (req, res) => {
  const { reply_message } = req.body;
  try {
    await db.query(
      'UPDATE inquiries SET status = ?, replied_at = NOW(), reply_message = ? WHERE id = ?',
      ['replied', reply_message, req.params.id]
    );
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
    const [inquiry] = await db.query(
      'SELECT * FROM inquiries WHERE id = ? AND (client_id = ? OR email = (SELECT email FROM customers WHERE id = ?))',
      [req.params.id, clientId, clientId]
    );
    
    if (inquiry.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Update the inquiry with client's reply
    await db.query(
      'UPDATE inquiries SET status = ?, client_reply = ?, client_replied_at = NOW() WHERE id = ?',
      ['client_replied', client_message, req.params.id]
    );
    
    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    await db.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiryStats = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const query = `
      SELECT 
        COUNT(*) as total_inquiries,
        SUM(CASE WHEN i.status = 'new' THEN 1 ELSE 0 END) as new_inquiries,
        SUM(CASE WHEN i.status = 'replied' THEN 1 ELSE 0 END) as replied_inquiries,
        SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as closed_inquiries,
        SUM(CASE WHEN i.priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN i.priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN i.priority = 'low' THEN 1 ELSE 0 END) as low_priority
      FROM inquiries i
      LEFT JOIN listings l ON i.property_id = l.listing_id
      WHERE l.user_id = ?
    `;
    const [rows] = await db.query(query, [user_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inquiry stats for client
exports.getClientInquiryStats = async (req, res) => {
  const clientId = req.user?.id;
  try {
    const query = `
      SELECT 
        COUNT(*) as total_inquiries,
        SUM(CASE WHEN i.status = 'new' THEN 1 ELSE 0 END) as new_inquiries,
        SUM(CASE WHEN i.status = 'replied' THEN 1 ELSE 0 END) as replied_inquiries,
        SUM(CASE WHEN i.status = 'client_replied' THEN 1 ELSE 0 END) as client_replied_inquiries,
        SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as closed_inquiries
      FROM inquiries i
      WHERE i.client_id = ? OR i.email = (SELECT email FROM customers WHERE id = ?)
    `;
    const [rows] = await db.query(query, [clientId, clientId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 