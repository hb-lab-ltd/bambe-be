const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");

router.get("/", listingController.getListings);
router.get("/:id", listingController.getListingById);
router.post("/", listingController.createListing);
router.put("/:id", listingController.updateListing);
router.delete("/:id", listingController.deleteListing);
router.get('/single/:listing_id', listingController.getListingWithImages);
router.get("/listing/product", listingController.getAllListingsAndProducts);



module.exports = router;
