const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/", listingController.getListings);
router.get("/pagination", listingController.getListingsWithPagination);
router.get("/listing/:id", listingController.getListingById);
router.post("/", authMiddleware.authenticate, listingController.createListing);
router.put("/:id", listingController.updateListing);
router.delete("/:id", listingController.deleteListing);
router.get('/single/:listing_id', listingController.getListingWithImages);
router.get("/listings/product", listingController.getAllListingsAndProducts);
router.get('/userlistings', authMiddleware.authenticate, listingController.getUserListings);
router.post('/polygon', listingController.getListingsInPolygon);



module.exports = router;
