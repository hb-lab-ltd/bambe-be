const express = require('express');
const router = express.Router();
const productImageController = require('../controllers/ProductImages');

const uploadImage = productImageController.uploadImage;


router.post('/', uploadImage, productImageController.createProductImage);

router.get('/:product_id', productImageController.getProductImages);

router.delete('/:id', productImageController.deleteProductImage);

module.exports = router;
