const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.get('/', customersController.getAllCustomers); // Get all customers
router.post('/', customersController.createCustomer); // Create a new customer
router.get('/:id', customersController.getCustomerById); // Get a single customer by ID
router.put('/:id', customersController.updateCustomer); // Update a customer by ID
router.delete('/:id', customersController.deleteCustomer); // Delete a customer by ID

module.exports = router;
