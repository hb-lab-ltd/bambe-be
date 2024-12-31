const express = require('express');
const router = express.Router();
const ordersProductController = require('../controllers/ordersproductController');

router.get('/', ordersProductController.getAllOrders); // Get all orders

router.post('/', ordersProductController.createOrder); // Create a new order

router.get('/:id', ordersProductController.getOrderById); // Get an order by ID

router.put('/:id', ordersProductController.updateOrder); // Update an order by ID

router.delete('/:id', ordersProductController.deleteOrder); // Delete an order by ID

module.exports = router;
