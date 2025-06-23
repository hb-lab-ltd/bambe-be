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
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    area: row.square_feet,
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


exports.getUserListings = async (req, res) => {
  const user_id = req.user?.id;
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
      WHERE p.user_id = ? 
    `;

    const [rows] = await db.query(query, [user_id]);

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
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    area: row.square_feet,
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
          p.coordinates,
          p.category_id,
          p.created_at,
          pc.category_name,
          i.id AS image_id,
          i.image_url,
          i.is_primary
        FROM listings p
        LEFT JOIN property_categories pc ON p.category_id = pc.category_id
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
            coordinates: row.coordinates,
            status: row.status,
            category_id: row.category_id,
            category_name: row.category_name,
            created_at: row.created_at,
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    area: row.square_feet,
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

exports.getListingsWithPagination = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        // Filter parameters
        const {
            propertyType,
            category,
            minPrice,
            maxPrice,
            location,
            bedrooms,
            bathrooms,
            status,
            sortBy = 'newest'
        } = req.query;

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (propertyType) {
            whereConditions.push('p.listing_type = ?');
            queryParams.push(propertyType);
        }

        if (category) {
            whereConditions.push('p.category_id = ?');
            queryParams.push(category);
        }

        if (minPrice) {
            whereConditions.push('p.price >= ?');
            queryParams.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            whereConditions.push('p.price <= ?');
            queryParams.push(parseFloat(maxPrice));
        }

        if (location) {
            whereConditions.push('p.location LIKE ?');
            queryParams.push(`%${location}%`);
        }

        if (bedrooms) {
            whereConditions.push('p.bedrooms >= ?');
            queryParams.push(parseInt(bedrooms));
        }

        if (bathrooms) {
            whereConditions.push('p.bathrooms >= ?');
            queryParams.push(parseInt(bathrooms));
        }

        if (status) {
            whereConditions.push('p.status = ?');
            queryParams.push(status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Build ORDER BY clause
        let orderByClause = 'ORDER BY p.created_at DESC';
        switch (sortBy) {
            case 'price_asc':
                orderByClause = 'ORDER BY p.price ASC';
                break;
            case 'price_desc':
                orderByClause = 'ORDER BY p.price DESC';
                break;
            case 'oldest':
                orderByClause = 'ORDER BY p.created_at ASC';
                break;
            case 'newest':
            default:
                orderByClause = 'ORDER BY p.created_at DESC';
                break;
        }

        // Get total count first (without image joins)
        const countQuery = `
            SELECT COUNT(DISTINCT p.listing_id) as total_count
            FROM listings p
            LEFT JOIN property_categories pc ON p.category_id = pc.category_id
            ${whereClause}
        `;

        const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));
        const totalItems = countResult[0].total_count;
        const totalPages = Math.ceil(totalItems / limit);

        // Base query with filters - Fixed pagination issue
        const query = `
            SELECT 
                p.listing_id,
                p.title,
                p.description,
                p.price,
                p.location,
                p.listing_type,
                p.status,
                p.coordinates,
                p.category_id,
                p.bedrooms,
                p.bathrooms,
                p.square_feet,
                p.created_at,
                pc.category_name,
                i.id AS image_id,
                i.image_url,
                i.is_primary
            FROM (
                SELECT DISTINCT
                    p.listing_id,
                    p.title,
                    p.description,
                    p.price,
                    p.location,
                    p.listing_type,
                    p.status,
                    p.coordinates,
                    p.category_id,
                    p.bedrooms,
                    p.bathrooms,
                    p.square_feet,
                    p.created_at
                FROM listings p
                LEFT JOIN property_categories pc ON p.category_id = pc.category_id
                ${whereClause}
                ${orderByClause}
                LIMIT ? OFFSET ?
            ) p
            LEFT JOIN property_categories pc ON p.category_id = pc.category_id
            LEFT JOIN listingimages i ON p.listing_id = i.listing_id
        `;

        // Add pagination parameters
        queryParams.push(limit, offset);

        const [rows] = await db.query(query, queryParams);

        if (rows.length === 0) {
            return res.status(404).json({ 
                message: 'No listings found',
                data: [],
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: page,
                    itemsPerPage: limit
                }
            });
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
                    coordinates: row.coordinates,
                    status: row.status,
                    category_id: row.category_id,
                    category_name: row.category_name,
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    area: row.square_feet,
                    created_at: row.created_at,
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    area: row.square_feet,
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

        res.json({
            data: listings,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error('Error retrieving listings with pagination and filters:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add this new endpoint to your listings controller
exports.getListingsInPolygon = async (req, res) => {
    try {
        const { polygonCoordinates } = req.body;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        if (!polygonCoordinates || !Array.isArray(polygonCoordinates)) {
            return res.status(400).json({ error: 'Invalid polygon coordinates' });
        }

        // Convert coordinates to MySQL POLYGON format
        const polygonString = polygonCoordinates
            .map(coord => `${coord[0]} ${coord[1]}`)
            .join(',');

        const query = `
            SELECT 
                p.listing_id,
                p.title,
                p.description,
                p.price,
                p.location,
                p.listing_type,
                p.status,
                p.coordinates,
                p.bedrooms,
                p.bathrooms,
                p.square_feet,
                p.created_at,
                i.id AS image_id,
                i.image_url,
                i.is_primary,
                
            FROM listings p
            LEFT JOIN listingimages i ON p.listing_id = i.listing_id
            WHERE ST_CONTAINS(
                ST_GeomFromText('POLYGON((${polygonString}))'),
                ST_GeomFromText(CONCAT('POINT(', 
    SUBSTRING_INDEX(p.coordinates, ',', -1), ' ', 
    SUBSTRING_INDEX(p.coordinates, ',', 1), ')'))
            )
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query(query, [limit, offset]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                message: 'No listings found in this area',
                data: [],
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: page,
                    itemsPerPage: limit
                }
            });
        }

        const totalItems = rows[0].total_count;
        const totalPages = Math.ceil(totalItems / limit);

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
                    coordinates: row.coordinates,
                    status: row.status,
                    created_at: row.created_at,
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    area: row.square_feet,
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

        res.json({
            data: listings,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error('Error retrieving listings in polygon:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getListingWithImages = async (req, res) => {
  try {
    const { listing_id } = req.params;
    
    const query = `
      SELECT 
        l.*,
        pc.category_name,
        u.username as agent_name,
        u.email as agent_email,
        u.role as agent_role
      FROM listings l
      LEFT JOIN property_categories pc ON l.category_id = pc.category_id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.listing_id = ?
    `;

    const [listingRows] = await db.query(query, [listing_id]);

    if (listingRows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = listingRows[0];

    // Get images for this listing
    const imageQuery = `
      SELECT id, image_url as url, is_primary
      FROM listingimages 
      WHERE listing_id = ?
      ORDER BY is_primary DESC, id ASC
    `;

    const [imageRows] = await db.query(imageQuery, [listing_id]);

    const response = {
      id: listing.listing_id,
      name: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      coordinates: listing.coordinates,
      listing_type: listing.listing_type,
      status: listing.status,
      category_id: listing.category_id,
      category_name: listing.category_name,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      area: listing.square_feet,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      user_id: listing.user_id,
      agent: {
        name: listing.agent_name,
        email: listing.agent_email,
        role: listing.agent_role
      },
      images: imageRows.map(img => ({
        id: img.id,
        url: img.url,
        is_primary: img.is_primary
      }))
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching listing with images:", err);
    res.status(500).json({ error: "Internal server error" });
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
  const user_id = req.user?.id;

  if (!user_id) {
      return res.status(400).json({ message: 'User ID is missing from token' });
  }
  try {
    const {category_id, title, description, price, location, listing_type, coordinates } = req.body;
    const [result] = await db.query(
      "INSERT INTO listings (user_id, category_id, title, description, price, location, listing_type, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, category_id, title, description, price, location, listing_type, coordinates]
    );
    res.status(201).json({ id: result.insertId, message: "Listing created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { title, description, price, location, listing_type, coordinates, status, category_id } = req.body;
    
    // Build dynamic query based on provided fields
    let query = "UPDATE listings SET ";
    let params = [];
    let updates = [];
    
    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (location !== undefined) {
      updates.push("location = ?");
      params.push(location);
    }
    if (listing_type !== undefined) {
      updates.push("listing_type = ?");
      params.push(listing_type);
    }
    if (coordinates !== undefined) {
      updates.push("coordinates = ?");
      params.push(coordinates);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (category_id !== undefined) {
      updates.push("category_id = ?");
      params.push(category_id);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    query += updates.join(", ") + " WHERE listing_id = ?";
    params.push(req.params.id);
    
    await db.query(query, params);
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    console.error('Error updating listing:', err);
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
