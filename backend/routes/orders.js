// routes/orders.js
const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/cancel', cancelOrder);

module.exports = router;