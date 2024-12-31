const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', productsController.getAllProductsWithImages);
router.post('/',authMiddleware.authenticate, productsController.createProduct);
router.get('/:id', productsController.getProductById); 
router.put('/:id', productsController.updateProduct); 
router.delete('/:id', productsController.deleteProduct); 
<<<<<<< HEAD
router.get('product/:productId', productsController.getProductWithImages);
=======
router.get('/single/:productId', productsController.getProductWithImages);
>>>>>>> refs/remotes/origin/main

module.exports = router;
