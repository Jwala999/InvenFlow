const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out', 'adjustment', 'return'],
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    maxlength: [200, 'Reason cannot exceed 200 characters'],
    default: '',
  },
  reference: {
    type: String,
    default: '',
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

stockTransactionSchema.index({ product: 1, createdAt: -1 });
stockTransactionSchema.index({ type: 1, createdAt: -1 });
stockTransactionSchema.index({ performedBy: 1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);