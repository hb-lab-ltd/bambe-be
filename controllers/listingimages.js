const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/listing');
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size per image (5MB)
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

exports.uploadImages = upload.array('images'); 

exports.createProductImages = async (req, res) => {
    const { listing_id } = req.body;

    if (!listing_id || !req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Listing ID and at least one image file are required' });
    }

    try {
        const imageRecords = req.files.map((file, index) => [
            listing_id,
            `/uploads/listing/${file.filename}`,
            index === 0 
        ]);

        const sqlQuery = `INSERT INTO listingimages (listing_id, image_url, is_primary) VALUES ?`;

        const [result] = await pool.query(sqlQuery, [imageRecords]);

        res.json({
            message: 'Images uploaded successfully',
            images: imageRecords.map((image, index) => ({
                id: result.insertId + index,
                listing_id: image[0],
                image_url: image[1],
                is_primary: image[2],
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getListingImages = async (req, res) => {
    const { listing_id } = req.params;

    if (!listing_id) {
        return res.status(400).json({ message: 'Listing ID is required' });
    }

    try {
        const [images] = await pool.query(
            `SELECT * FROM listingimages WHERE listing_id = ?`,
            [listing_id]
        );
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProductImage = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
    }

    try {
        const [imageData] = await pool.query(`SELECT image_url FROM listingimages WHERE id = ?`, [id]);

        if (imageData.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const imagePath = path.join(__dirname, '..', imageData[0].image_url);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        const [result] = await pool.query(`DELETE FROM listingimages WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
