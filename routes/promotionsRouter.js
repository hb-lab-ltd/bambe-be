const express = require('express');
const router = express.Router();
const promotionsController = require('../controllers/promotionsController');

router.get('/', promotionsController.getAllPromotions);
router.post('/', promotionsController.createPromotion);
router.get('/:id', promotionsController.getPromotionById);
router.put('/:id', promotionsController.updatePromotion);
router.delete('/:id', promotionsController.deletePromotion);

module.exports = router;
