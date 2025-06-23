const express = require("express");
const router = express.Router();
const clientAuthController = require("../controllers/clientAuthController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.post("/register-from-inquiry", clientAuthController.registerFromInquiry);
router.post("/login", clientAuthController.clientLogin);
router.post("/forgot-password", clientAuthController.forgotPassword);
router.post("/reset-password", clientAuthController.resetPassword);

// Protected routes (require client authentication)
router.get("/profile", authMiddleware.authenticateClient, clientAuthController.getClientProfile);
router.put("/profile", authMiddleware.authenticateClient, clientAuthController.updateClientProfile);
router.put("/change-password", authMiddleware.authenticateClient, clientAuthController.changePassword);

module.exports = router; 