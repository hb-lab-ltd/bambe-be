const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/listing';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).array('images', 10); // Accept up to 10 images per upload

exports.upload = upload;

exports.getAllListingImages = async (req, res) => {
  try {
    const images = await prisma.listingImage.findMany();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getListingImageById = async (req, res) => {
  try {
    const image = await prisma.listingImage.findUnique({ where: { id: Number(req.params.id) } });
    if (!image) return res.status(404).json({ error: 'Listing image not found' });
    res.json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createListingImage = async (req, res) => {
  // Debug logging
  console.log('DEBUG req.body:', req.body);
  console.log('DEBUG req.file:', req.file);
  console.log('DEBUG req.files:', req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No image files provided' });
  }

  const { listing_id, is_primary = false } = req.body;
  
  if (!listing_id) {
    return res.status(400).json({ error: 'listing_id is required' });
  }

  try {
    const image_urls = req.files.map(file => `/uploads/listing/${file.filename}`);
    
    const images = await prisma.listingImage.createMany({ 
      data: image_urls.map((image_url, index) => ({ 
        listing_id: parseInt(listing_id), 
        image_url, 
        is_primary: is_primary === 'true' || is_primary === true 
      }))
    });
    
    res.status(201).json({ 
      message: 'Listing images uploaded successfully',
      images: images.count // Assuming images.count is available from createMany
    });
  } catch (err) {
    console.error('Error creating listing image:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateListingImage = async (req, res) => {
  const { listing_id, image_url, is_primary } = req.body;
  try {
    await prisma.listingImage.update({ where: { id: Number(req.params.id) }, data: { listing_id, image_url, is_primary } });
    res.json({ message: 'Listing image updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteListingImage = async (req, res) => {
  try {
    await prisma.listingImage.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Listing image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
