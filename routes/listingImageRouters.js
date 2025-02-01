const express = require('express');
const router = express.Router();
const listingImageController = require('../controllers/listingimages');

const uploadImage = listingImageController.uploadImages;


router.post('/', uploadImage, listingImageController.createProductImages);

router.get('/:product_id', listingImageController.getListingImages);

router.delete('/:id', listingImageController.deleteProductImage);

module.exports = router;
