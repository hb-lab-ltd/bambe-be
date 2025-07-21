const express = require('express');
const router = express.Router();
const listingImageController = require('../controllers/listingimages');

router.get('/', listingImageController.getAllListingImages);
router.get('/:id', listingImageController.getListingImageById);
router.post('/', listingImageController.upload, listingImageController.createListingImage);
router.put('/:id', listingImageController.updateListingImage);
router.delete('/:id', listingImageController.deleteListingImage);

module.exports = router;
