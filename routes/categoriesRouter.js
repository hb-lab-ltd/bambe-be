const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

router.get('/', categoriesController.getAllCategories); // Get all categories
router.post('/', categoriesController.createCategory); // Create a new category
router.get('/:id', categoriesController.getCategoryById); // Get a single category by ID
router.put('/:id', categoriesController.updateCategory); // Update a category by ID
router.delete('/:id', categoriesController.deleteCategory); // Delete a category by ID

module.exports = router;
