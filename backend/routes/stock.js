// routes/stock.js
const express = require('express');
const router = express.Router();
const { stockIn, stockOut, adjustStock, getTransactions, getLowStockProducts } = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/transactions', getTransactions);
router.get('/low-stock', getLowStockProducts);
router.post('/in', authorize('admin', 'staff'), stockIn);
router.post('/out', authorize('admin', 'staff'), stockOut);
router.post('/adjust', authorize('admin'), adjustStock);

module.exports = router;