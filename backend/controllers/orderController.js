const Order = require('../models/Order');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Notification = require('../models/Notification');

// ─── Place Order ──────────────────────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate stock & build order items
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        });
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      notes,
    });

    // Deduct stock for each item
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const prev = product.quantity;
      product.quantity -= item.quantity;
      await product.save();

      await StockTransaction.create({
        product: item.product,
        type: 'stock_out',
        quantity: item.quantity,
        previousQuantity: prev,
        newQuantity: product.quantity,
        reason: `Purchase - Order ${order.orderNumber}`,
        reference: order.orderNumber,
        performedBy: req.user.id,
      });

      // Low stock alert notification
      if (product.quantity <= product.lowStockThreshold) {
        await Notification.create({
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `"${product.name}" has only ${product.quantity} units left.`,
          icon: 'alert',
          user: req.user.id,
          meta: { productId: product._id, quantity: product.quantity },
        });
      }
    }

    // Purchase notification
    await Notification.create({
      type: 'purchase',
      title: 'New Order Placed',
      message: `${req.user.name} purchased ${orderItems.length} item(s) — ${order.orderNumber} ($${totalAmount.toFixed(2)})`,
      icon: 'shopping-cart',
      user: req.user.id,
      meta: { orderId: order._id, orderNumber: order.orderNumber, totalAmount },
    });

    const populated = await Order.findById(order._id).populate('user', 'name email');
    res.status(201).json({
      success: true,
      message: `Order ${order.orderNumber} placed successfully!`,
      data: { order: populated },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name sku imageUrl');
    res.json({ success: true, data: { orders } });
  } catch (error) { next(error); }
};

// ─── Get All Orders (admin) ───────────────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .limit(limit * 1).skip((page - 1) * limit);
    const total = await Order.countDocuments(query);
    res.json({ success: true, data: { orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

// ─── Cancel Order ─────────────────────────────────────────────────────────
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${order.status} order.` });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prev = product.quantity;
        product.quantity += item.quantity;
        await product.save();
        await StockTransaction.create({
          product: item.product,
          type: 'return',
          quantity: item.quantity,
          previousQuantity: prev,
          newQuantity: product.quantity,
          reason: `Order cancelled - ${order.orderNumber}`,
          performedBy: req.user.id,
        });
      }
    }
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, message: 'Order cancelled and stock restored.', data: { order } });
  } catch (error) { next(error); }
};