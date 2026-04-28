const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Core counts
    const [totalProducts, totalUsers] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      User.countDocuments({ isActive: true }),
    ]);

    // Stock aggregations
    const stockAgg = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          lowStock: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$lowStockThreshold'] }, 1, 0],
            },
          },
          outOfStock: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
        },
      },
    ]);

    const { totalStock = 0, totalValue = 0, lowStock = 0, outOfStock = 0 } =
      stockAgg[0] || {};

    // Transactions this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyTransactions = await StockTransaction.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQty: { $sum: '$quantity' },
        },
      },
    ]);

    // Category breakdown (for pie chart)
    const categoryBreakdown = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          value: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Last 7 days activity (for bar chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyActivity = await StockTransaction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          count: { $sum: 1 },
          qty: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Recent transactions
    const recentTransactions = await StockTransaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: { totalProducts, totalStock, totalValue, lowStock, outOfStock, totalUsers },
        monthlyTransactions,
        categoryBreakdown,
        weeklyActivity,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};