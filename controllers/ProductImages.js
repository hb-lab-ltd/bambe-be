const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpeg, .jpg, or .png files are allowed'));
    }
});

// Middleware to handle file uploads
exports.uploadImage = upload.single('image');

// Create a product image
exports.createProductImage = async (req, res) => {
    const { product_id, is_primary } = req.body;

    if (!product_id || !req.file) {
        return res.status(400).json({ message: 'Product ID and an image file are required' });
    }

    try {
        // Construct the file URL
        const imageUrl = `/uploads/products/${req.file.filename}`;

        const [result] = await pool.query(
            `INSERT INTO ProductImages (product_id, image_url, is_primary) VALUES (?, ?, ?)`,
            [product_id, imageUrl, is_primary || false]
        );

        res.json({ id: result.insertId, image_url: imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get images for a specific product
exports.getProductImages = async (req, res) => {
    const { product_id } = req.params;

    if (!product_id) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const [images] = await pool.query(
            `SELECT * FROM ProductImages WHERE product_id = ?`,
            [product_id]
        );
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a product image
exports.deleteProductImage = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
    }

    try {
        // Get the image URL before deleting the database entry
        const [imageData] = await pool.query(`SELECT image_url FROM ProductImages WHERE id = ?`, [id]);

        if (imageData.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const imagePath = path.join(__dirname, '..', imageData[0].image_url);

        // Delete the image file
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Delete the database entry
        const [result] = await pool.query(`DELETE FROM ProductImages WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
