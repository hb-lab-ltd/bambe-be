const db = require("../db");

exports.getAllListingsAndProducts = async (req, res) => {
  try {
    const query = `
      SELECT * FROM (
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
        ORDER BY l.created_at DESC)
      
        UNION ALL

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
        ORDER BY p.created_at DESC)
      ) AS combined_data
      ORDER BY created_at DESC
    `;

    const [rows] = await db.query(query);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found" });
    }

    const results = {};
    
    rows.forEach((row) => {
      if (!results[row.id]) {
        results[row.id] = {
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
          images: [],
        };
      }

      if (row.image_id) {
        results[row.id].images.push({
          id: row.image_id,
          url: row.image_url,
          is_primary: row.is_primary,
        });
      }
    });

    res.json(Object.values(results)); // Convert object back to an array
  } catch (err) {
    console.error("Error fetching listings and products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getListings = async (req, res) => {
    try {
      // 
      const query = `
        SELECT 
          p.listing_id,
          p.title,
          p.description,
          p.price,
          p.location,
          p.listing_type,
          p.status,
          p.created_at,
          i.id AS image_id,
          i.image_url,
          i.is_primary
        FROM listings p
        LEFT JOIN listingimages i ON p.listing_id = i.listing_id
      `;
  
      const [rows] = await db.query(query);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No listings found' });
      }
  
      const listingsMap = {};
      rows.forEach(row => {
        if (!listingsMap[row.listing_id]) {
          listingsMap[row.listing_id] = {
            id: row.listing_id,
            name: row.title,
            description: row.description,
            price: row.price,
            listing_type: row.listing_type,
            location: row.location,
            status: row.status,
            created_at: row.created_at,
            images: [],
          };
        }
        if (row.image_id) {
          listingsMap[row.listing_id].images.push({
            id: row.image_id,
            url: row.image_url,
            is_primary: row.is_primary,
          });
        }
      });
  
      const listings = Object.values(listingsMap);
  
      res.json(listings);
    } catch (err) {
      console.error('Error retrieving listings with images:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  exports.getListingWithImages = async (req, res) => {
    const { listing_id } = req.params;
  
    try {
        const query = `
          SELECT 
            p.listing_id,
            p.title,
            p.description,
            p.price,
            p.location,
            p.coordinates,
            p.listing_type,
            p.status,
            p.created_at,
            p.user_id,
            i.id AS image_id,
            i.image_url,
            i.is_primary
          FROM listings p
          LEFT JOIN listingimages i ON p.listing_id = i.listing_id
        WHERE p.listing_id = ?
      `;
  
      const [rows] = await db.query(query, [listing_id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const product = {
        
        id: rows[0].listing_id,
            name: rows[0].title,
            description: rows[0].description,
            price: rows[0].price,
            listing_type: rows[0].listing_type,
            location: rows[0].location,
            coordinates: rows[0].coordinates,
            status: rows[0].status,
            user_id: rows[0].user_id,
            created_at: rows[0].created_at,
        images: rows
          .filter(row => row.image_id)
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
  

exports.getListingById = async (req, res) => {
  try {
    const [listing] = await db.query("SELECT * FROM listings WHERE listing_id = ?", [req.params.id]);
    if (listing.length === 0) return res.status(404).json({ error: "Listing not found" });
    res.json(listing[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    const { user_id, category_id, title, description, price, location, listing_type, coordinates } = req.body;
    await db.query(
      "INSERT INTO listings (user_id, category_id, title, description, price, location, listing_type, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, category_id, title, description, price, location, listing_type, coordinates]
    );
    res.status(201).json({ message: "Listing created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { title, description, price, location, listing_type, coordinates } = req.body;
    await db.query(
      "UPDATE listings SET title = ?, description = ?, price = ?, location = ?, listing_type = ?, coordinates = ? WHERE listing_id = ?",
      [title, description, price, location, listing_type,coordinates, req.params.id]
    );
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    await db.query("DELETE FROM listings WHERE listing_id = ?", [req.params.id]);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
