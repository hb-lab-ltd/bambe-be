const pool = require('../db');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ordersproduct INNER JOIN productimages ON ordersproduct.product_id=productimages.product_id INNER JOIN products ON ordersproduct.product_id=products.id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new order




exports.createOrder = async (req, res) => {
  console.log("Request Body:", req.body);  // Log the entire request body
  const { customer_details, order_items } = req.body;

  const { first_name, last_name, email, phone_number, address_line, city, state, zip_code } = customer_details;
  console.log(first_name, last_name, email, phone_number, address_line, city, state, zip_code);

  order_items.forEach((item) => {
    const { product_id, quantity, price, total } = item;
    console.log(product_id, quantity, price, total);
  });

  try {
    const order_status = "Pending";
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    for (let item of order_items) {
      const { product_id, quantity, price, total } = item;
      await connection.query(
        `INSERT INTO ordersproduct (first_name, last_name, email, phone_number, address_line, city, state, zip_code, product_id, quantity, price, total, order_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [first_name, last_name, email, phone_number, address_line, city, state, zip_code, product_id, quantity, price, total, order_status]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ message: "Product order successfully placed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};













// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ordersproduct WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  const { first_name, last_name, email, phone_number, address_line, city, state, zip_code, product_id, quantity, price, total, order_status } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE ordersproduct 
      SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address_line = ?, city = ?, state = ?, zip_code = ?, 
          product_id = ?, quantity = ?, price = ?, total = ?, order_status = ?
      WHERE id = ?`,
      [first_name, last_name, email, phone_number, address_line, city, state, zip_code, product_id, quantity, price, total, order_status, req.params.id]
    );
    if (result.affectedRows === 0) {
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
    const [result] = await pool.query('DELETE FROM ordersproduct WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
