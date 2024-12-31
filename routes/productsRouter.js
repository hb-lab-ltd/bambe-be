const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', productsController.getAllProductsWithImages);
router.get('userproduct/', authMiddleware.authenticate, productsController.getAdminProducts);
router.post('/',authMiddleware.authenticate, productsController.createProduct);
router.get('/:id', productsController.getProductById); 
router.put('/:id', productsController.updateProduct); 
router.delete('/:id', productsController.deleteProduct); 
router.get('/single/:productId', productsController.getProductWithImages);
module.exports = router;
