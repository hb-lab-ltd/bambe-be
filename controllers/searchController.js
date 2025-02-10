const db = require('../db');

exports.searchListingsAndProducts = async (req, res) => {
  const { keyword } = req.query;

  try {
    const query = `
      (SELECT 
        l.listing_id AS id,
        l.title AS name,
        l.description,
        l.price,
        l.location,
        l.coordinates,
        l.listing_type,
        l.status,
        'listing' AS type,
        l.created_at,
        li.id AS image_id,
        li.image_url,
        li.is_primary
      FROM listings l
      LEFT JOIN listingimages li ON l.listing_id = li.listing_id
      WHERE l.title LIKE ? OR l.description LIKE ? OR l.location LIKE ?)
      
      UNION

      (SELECT 
        p.id AS id,
        p.name,
        p.description,
        p.price,
        NULL AS location,
        NULL AS coordinates,
        NULL AS listing_type,
        NULL AS status,
        'product' AS type,
        p.created_at,
        pi.id AS image_id,
        pi.image_url,
        pi.is_primary
      FROM products p
      LEFT JOIN productimages pi ON p.id = pi.product_id
      WHERE p.name LIKE ? OR p.description LIKE ?)
      ORDER BY created_at DESC
    `;

    const [rows] = await db.query(query, [
      `%${keyword}%`, `%${keyword}%`, `%${keyword}%`,
      `%${keyword}%`, `%${keyword}%`
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    const results = [];
    const itemMap = {};

    rows.forEach(row => {
      if (!itemMap[row.id]) {
        itemMap[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          location: row.location,
          coordinates: row.coordinates,
          listing_type: row.listing_type,
          status: row.status,
          type: row.type,
          created_at: row.created_at,
          images: []
        };
        results.push(itemMap[row.id]);
      }

      if (row.image_id) {
        itemMap[row.id].images.push({
          id: row.image_id,
          url: row.image_url,
          is_primary: row.is_primary,
        });
      }
    });

    res.json(results);
  } catch (err) {
    console.error("Error searching listings and products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
