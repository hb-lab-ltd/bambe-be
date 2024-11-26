const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/', ordersController.getAllOrders); // Get all orders
router.post('/', ordersController.createOrder); // Create a new order
router.get('/:id', ordersController.getOrderById); // Get a single order by ID
router.put('/:id', ordersController.updateOrder); // Update an order by ID
router.delete('/:id', ordersController.deleteOrder); // Delete an order by ID

module.exports = router;
