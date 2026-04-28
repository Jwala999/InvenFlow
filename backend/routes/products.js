const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getCategorySummary,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getProducts);
router.get('/categories', getCategorySummary);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'staff'), createProduct);
router.put('/:id', authorize('admin', 'staff'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;