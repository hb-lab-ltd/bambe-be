const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

router.get('/', productsController.getAllProducts); // Get all products
router.post('/', productsController.createProduct); // Create a new product
router.get('/:id', productsController.getProductById); // Get a single product by ID
router.put('/:id', productsController.updateProduct); // Update a product by ID
router.delete('/:id', productsController.deleteProduct); // Delete a product by ID

module.exports = router;
