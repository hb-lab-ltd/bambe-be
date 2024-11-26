const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptionsController');

router.get('/', subscriptionsController.getAllSubscriptions);
router.post('/', subscriptionsController.createSubscription);
router.get('/:id', subscriptionsController.getSubscriptionById);
router.put('/:id', subscriptionsController.updateSubscription);
router.delete('/:id', subscriptionsController.deleteSubscription);

module.exports = router;
