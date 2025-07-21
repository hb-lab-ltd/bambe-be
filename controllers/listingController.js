const prisma = require('../prismaClient');

exports.getAllListingsAndProducts = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({ include: { images: true }, orderBy: { created_at: 'desc' } });
    const products = await prisma.product.findMany({ include: { images: true }, orderBy: { created_at: 'desc' } });
    const combined = [
      ...listings.map(l => ({ ...l, type: 'listing' })),
      ...products.map(p => ({ ...p, type: 'product' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (!combined.length) {
      return res.status(404).json({ error: 'No data found' });
    }
    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserListings = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const listings = await prisma.listing.findMany({
      where: { user_id },
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });
    if (!listings.length) {
      return res.status(404).json({ message: 'No listings found' });
    }
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      include: { images: true, category: true },
      orderBy: { created_at: 'desc' }
    });
    if (!listings.length) {
      return res.status(404).json({ message: 'No listings found' });
    }
    res.json(listings);
  } catch (err) {
    console.error('Error in getListings:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getListingsWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const filters = {};
    if (req.query.propertyType) filters.listing_type = req.query.propertyType;
    if (req.query.category) filters.category_id = Number(req.query.category);
    if (req.query.minPrice) filters.price = { gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) filters.price = { ...filters.price, lte: parseFloat(req.query.maxPrice) };
    if (req.query.location) filters.location = { contains: req.query.location, mode: 'insensitive' };
    if (req.query.bedrooms) filters.bedrooms = { gte: parseInt(req.query.bedrooms) };
    if (req.query.bathrooms) filters.bathrooms = { gte: parseInt(req.query.bathrooms) };
    if (req.query.status) filters.status = req.query.status;
    const orderBy = req.query.sortBy === 'oldest' ? { created_at: 'asc' } : { created_at: 'desc' };
    const listings = await prisma.listing.findMany({
      where: filters,
      include: { images: true, category: true },
      orderBy,
      skip: offset,
      take: limit
    });
    const totalItems = await prisma.listing.count({ where: filters });
    if (!listings.length) {
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
    res.json({
      data: listings,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { listing_id: Number(req.params.id) }, include: { images: true, category: true } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
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
    const { category_id, title, description, price, location, listing_type, coordinates } = req.body;
    const listing = await prisma.listing.create({
      data: { 
        user_id, 
        category_id: parseInt(category_id), 
        title, 
        description, 
        price: parseFloat(price), 
        location, 
        listing_type, 
        coordinates 
      }
    });
    res.status(201).json({ id: listing.listing_id, message: 'Listing created successfully' });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { category_id, title, description, price, location, listing_type, coordinates, status } = req.body;
    await prisma.listing.update({
      where: { listing_id: Number(req.params.id) },
      data: { category_id, title, description, price, location, listing_type, coordinates, status }
    });
    res.json({ message: 'Listing updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    await prisma.listing.delete({ where: { listing_id: Number(req.params.id) } });
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single listing with images and related info
exports.getListingWithImages = async (req, res) => {
  try {
    const { listing_id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { listing_id: Number(listing_id) },
      include: {
        images: true,
        category: true,
        user: { select: { username: true, email: true, role: true } }
      }
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({
      ...listing,
      agent: listing.user ? {
        name: listing.user.username,
        email: listing.user.email,
        role: listing.user.role
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get listings within a polygon (approximate with bounding box)
exports.getListingsInPolygon = async (req, res) => {
  try {
    const { polygonCoordinates } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    if (!polygonCoordinates || !Array.isArray(polygonCoordinates) || polygonCoordinates.length < 3) {
      return res.status(400).json({ error: 'Invalid polygon coordinates' });
    }
    // Approximate polygon with bounding box
    const lats = polygonCoordinates.map(coord => parseFloat(coord[0]));
    const lngs = polygonCoordinates.map(coord => parseFloat(coord[1]));
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    // Assume coordinates are stored as "lat,lng" string
    const listings = await prisma.listing.findMany({
      where: {
        AND: [
          { coordinates: { not: null } },
          {
            // Prisma does not support spatial queries, so filter by bounding box
            // This is a workaround: filter listings whose coordinates are within the bounding box
            // You may want to use a spatial DB or raw query for true polygon support
            OR: [
              {
                coordinates: {
                  contains: '', // dummy to allow custom filter below
                }
              }
            ]
          }
        ]
      },
      include: { images: true },
      skip: offset,
      take: limit
    });
    // Further filter in JS for bounding box
    const filtered = listings.filter(listing => {
      if (!listing.coordinates) return false;
      const [lat, lng] = listing.coordinates.split(',').map(Number);
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });
    res.json({
      data: filtered,
      pagination: {
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
