const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

// ─── Stock In ─────────────────────────────────────────────────────────────
exports.stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, reason, reference } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const previousQuantity = product.quantity;
    product.quantity += quantity;
    await product.save();

    const transaction = await StockTransaction.create({
      product: productId,
      type: 'stock_in',
      quantity,
      previousQuantity,
      newQuantity: product.quantity,
      reason: reason || 'Stock replenishment',
      reference: reference || '',
      performedBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `Added ${quantity} units to stock.`,
      data: { product, transaction },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Stock Out ────────────────────────────────────────────────────────────
exports.stockOut = async (req, res, next) => {
  try {
    const { productId, quantity, reason, reference } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`,
      });
    }

    const previousQuantity = product.quantity;
    product.quantity -= quantity;
    await product.save();

    const transaction = await StockTransaction.create({
      product: productId,
      type: 'stock_out',
      quantity,
      previousQuantity,
      newQuantity: product.quantity,
      reason: reason || 'Order fulfillment',
      reference: reference || '',
      performedBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `Removed ${quantity} units from stock.`,
      data: { product, transaction },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Adjust Stock ─────────────────────────────────────────────────────────
exports.adjustStock = async (req, res, next) => {
  try {
    const { productId, newQuantity, reason } = req.body;
    if (newQuantity === undefined || newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'New quantity must be 0 or greater.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const previousQuantity = product.quantity;
    const diff = newQuantity - previousQuantity;
    product.quantity = newQuantity;
    await product.save();

    const transaction = await StockTransaction.create({
      product: productId,
      type: 'adjustment',
      quantity: Math.abs(diff),
      previousQuantity,
      newQuantity,
      reason: reason || 'Manual stock adjustment',
      performedBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully.',
      data: { product, transaction },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Stock Transactions ───────────────────────────────────────────────
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId, type, startDate, endDate } = req.query;
    const query = {};

    if (productId) query.product = productId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await StockTransaction.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StockTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Low Stock Alert ──────────────────────────────────────────────────────
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      status: 'active',
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      data: { products, count: products.length },
    });
  } catch (error) {
    next(error);
  }
};