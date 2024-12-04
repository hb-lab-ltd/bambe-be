const pool = require('../db');

exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve a product and its images
exports.getProductWithImages = async (req, res) => {
  const { productId } = req.params;

  try {
    // Query to get product and its images
    const query = `
      SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.is_new,
        p.is_best_seller,
        p.is_on_promotion,
        p.created_at,
        i.id AS image_id,
        i.image_url,
        i.is_primary
      FROM Products p
      LEFT JOIN ProductImages i ON p.id = i.product_id
      WHERE p.id = ?
    `;

    const [rows] = await pool.query(query, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format the result to group images under the product
    const product = {
      id: rows[0].product_id,
      name: rows[0].name,
      description: rows[0].description,
      price: rows[0].price,
      is_new: rows[0].is_new,
      is_best_seller: rows[0].is_best_seller,
      is_on_promotion: rows[0].is_on_promotion,
      created_at: rows[0].created_at,
      images: rows
        .filter(row => row.image_id) // Only include rows with image data
        .map(row => ({
          id: row.image_id,
          url: row.image_url,
          is_primary: row.is_primary,
        })),
    };

    res.json(product);
  } catch (err) {
    console.error('Error retrieving product with images:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Retrieve all products with their images
exports.getAllProductsWithImages = async (req, res) => {
  try {
    // Query to fetch all products with their images
    const query = `
      SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.is_new,
        p.is_best_seller,
        p.is_on_promotion,
        p.created_at,
        i.id AS image_id,
        i.image_url,
        i.is_primary
      FROM Products p
      LEFT JOIN ProductImages i ON p.id = i.product_id
    `;

    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    // Group the results by product
    const productsMap = {};
    rows.forEach(row => {
      if (!productsMap[row.product_id]) {
        productsMap[row.product_id] = {
          id: row.product_id,
          name: row.name,
          description: row.description,
          price: row.price,
          is_new: row.is_new,
          is_best_seller: row.is_best_seller,
          is_on_promotion: row.is_on_promotion,
          created_at: row.created_at,
          images: [],
        };
      }
      if (row.image_id) {
        productsMap[row.product_id].images.push({
          id: row.image_id,
          url: row.image_url,
          is_primary: row.is_primary,
        });
      }
    });

    // Convert the map to an array
    const products = Object.values(productsMap);

    res.json(products);
  } catch (err) {
    console.error('Error retrieving products with images:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createProduct = async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
      return res.status(400).json({ message: 'User ID is missing from token' });
  }
  const {name, description, price, category_id, is_new, is_best_seller, is_on_promotion } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Products (user_id, name, description, price, category_id, is_new, is_best_seller, is_on_promotion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, description, price, category_id || null, is_new || false, is_best_seller || false, is_on_promotion || false]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { user_id, name, description, price, category_id, is_new, is_best_seller, is_on_promotion } = req.body;
  try {
    await pool.query(
      `UPDATE Products SET user_id = ?, name = ?, description = ?, price = ?, category_id = ?, is_new = ?, is_best_seller = ?, is_on_promotion = ? 
       WHERE id = ?`,
      [user_id, name, description, price, category_id || null, is_new || false, is_best_seller || false, is_on_promotion || false, req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
