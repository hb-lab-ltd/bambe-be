
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/agent/register', require('../controllers/authController').registerAgent);
router.post('/agent/pay', require('../controllers/authController').agentPay);
router.get('/agent/payment-status/:agentId', require('../controllers/authController').agentPaymentStatus);

module.exports = router;
