const express = require('express');
const router = express.Router();
const inquiriesController = require('../controllers/inquiriesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/', inquiriesController.createInquiry);

// Protected routes (Admin/Agent)
router.get('/', authMiddleware.authenticate, inquiriesController.getAllInquiries);
router.get('/agent', authMiddleware.authenticate, inquiriesController.getInquiriesByAgent);
router.get('/stats', authMiddleware.authenticate, inquiriesController.getInquiryStats);
router.get('/:id', authMiddleware.authenticate, inquiriesController.getInquiryById);
router.put('/:id', authMiddleware.authenticate, inquiriesController.updateInquiry);
router.post('/:id/reply', authMiddleware.authenticate, inquiriesController.replyToInquiry);
router.delete('/:id', authMiddleware.authenticate, inquiriesController.deleteInquiry);

// Client-specific routes
router.get('/client/all', authMiddleware.authenticateClient, inquiriesController.getInquiriesByClient);
router.get('/client/stats', authMiddleware.authenticateClient, inquiriesController.getClientInquiryStats);
router.get('/client/:id', authMiddleware.authenticateClient, inquiriesController.getInquiryByIdForClient);
router.post('/client/:id/reply', authMiddleware.authenticateClient, inquiriesController.clientReplyToInquiry);

module.exports = router; 