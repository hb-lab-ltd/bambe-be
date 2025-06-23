const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register client from inquiry
exports.registerFromInquiry = async (req, res) => {
  try {
    const { inquiry_id, name, email, phone, password } = req.body;

    // Check if client already exists
    const [existingClient] = await db.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({ 
        error: "Client with this email already exists. Please login instead." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find a default admin user to use as user_id
    let [adminUsers] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    let defaultUserId = 56; // Use a valid user ID from the existing users
    
    if (adminUsers.length > 0) {
      defaultUserId = adminUsers[0].id;
    }

    // Create client with a valid user_id
    const [clientResult] = await db.query(
      "INSERT INTO customers (name, email, phone, password, status, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, email, phone, hashedPassword, 'active', defaultUserId]
    );

    const clientId = clientResult.insertId;

    // Update inquiry to link with client (only if inquiry_id is provided)
    if (inquiry_id) {
      try {
        await db.query(
          "UPDATE inquiries SET client_id = ? WHERE id = ?",
          [clientId, inquiry_id]
        );
      } catch (updateError) {
        console.error('Update inquiry error:', updateError);
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

    res.status(201).json({
      message: "Client registered successfully",
      token,
      client: {
        id: clientId,
        name,
        email,
        phone
      }
    });
  } catch (error) {
    console.error("Error registering client:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};

// Client login
exports.clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find client
    const [clients] = await db.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (clients.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const client = clients[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
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

    res.json({
      message: "Login successful",
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone
      }
    });
  } catch (error) {
    console.error("Error during client login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get client profile
exports.getClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;

    const [clients] = await db.query(
      "SELECT id, name, email, phone, status, created_at FROM customers WHERE id = ?",
      [clientId]
    );

    if (clients.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(clients[0]);
  } catch (error) {
    console.error("Error fetching client profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update client profile
exports.updateClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { name, phone } = req.body;

    await db.query(
      "UPDATE customers SET name = ?, phone = ? WHERE id = ?",
      [name, phone, clientId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating client profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change client password
exports.changePassword = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get current password
    const [clients] = await db.query(
      "SELECT password FROM customers WHERE id = ?",
      [clientId]
    );

    if (clients.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, clients[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      "UPDATE customers SET password = ? WHERE id = ?",
      [hashedNewPassword, clientId]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send password reset email (simplified - just generate reset token)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [clients] = await db.query(
      "SELECT id, name FROM customers WHERE email = ?",
      [email]
    );

    if (clients.length === 0) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: clients[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token (in production, you'd store this in database)
    // For now, we'll just return it
    res.json({ 
      message: "Password reset instructions sent to your email",
      resetToken // In production, send this via email
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      "UPDATE customers SET password = ? WHERE id = ?",
      [hashedPassword, decoded.id]
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}; 