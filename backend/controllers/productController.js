const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Notification = require('../models/Notification');

// ─── Get All Products ─────────────────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      stockStatus,
    } = req.query;

    const query = {};

    // Improved search using regex (no text index required)
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: re },
        { sku: re },
        { description: re },
        { supplier: re },
      ];
    }

    if (category) query.category = category;

    // Default: exclude discontinued products unless status is explicitly provided
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'discontinued' };
    }

    let products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean({ virtuals: true });

    // Filter by stockStatus after query (if provided)
    if (stockStatus) {
      products = products.filter((p) => p.stockStatus === stockStatus);
    }

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Product ───────────────────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get recent stock transactions
    const recentTransactions = await StockTransaction.find({ product: product._id })
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: { product, recentTransactions },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Create Product ───────────────────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
    });

    // Create initial stock transaction if quantity > 0
    if (product.quantity > 0) {
      await StockTransaction.create({
        product: product._id,
        type: 'stock_in',
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        reason: 'Initial stock',
        performedBy: req.user.id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Product ───────────────────────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const { quantity, ...updateData } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Product ───────────────────────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Create notification before deleting
    await Notification.create({
      type: 'delete_product',
      title: 'Product Deleted',
      message: `"${product.name}" (SKU: ${product.sku}) was deleted by ${req.user.name}.`,
      icon: 'trash',
      user: req.user.id,
      meta: {
        productName: product.name,
        sku: product.sku,
      },
    });

    await Product.findByIdAndDelete(req.params.id);
    await StockTransaction.deleteMany({ product: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Categories Summary ───────────────────────────────────────────────
exports.getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};