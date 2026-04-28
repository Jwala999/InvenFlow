const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Connected to MongoDB for seeding...');

  await User.deleteMany({});
  await Product.deleteMany({});
  await StockTransaction.deleteMany({});

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@inventory.com',
    password: 'admin123',
    role: 'admin',
  });
  const staff = await User.create({
    name: 'Staff Member',
    email: 'staff@inventory.com',
    password: 'staff123',
    role: 'staff',
  });

  console.log('✅ Users created');

  const products = await Product.insertMany([
    { name: 'MacBook Pro 16"', sku: 'ELEC-001', category: 'Electronics', price: 2499, costPrice: 1800, quantity: 45, lowStockThreshold: 5, supplier: 'Apple Inc', createdBy: admin._id },
    { name: 'iPhone 15 Pro', sku: 'ELEC-002', category: 'Electronics', price: 999, costPrice: 650, quantity: 120, lowStockThreshold: 20, supplier: 'Apple Inc', createdBy: admin._id },
    { name: 'Samsung 4K Monitor', sku: 'ELEC-003', category: 'Electronics', price: 599, costPrice: 380, quantity: 8, lowStockThreshold: 10, supplier: 'Samsung', createdBy: admin._id },
    { name: 'Sony WH-1000XM5', sku: 'ELEC-004', category: 'Electronics', price: 349, costPrice: 200, quantity: 0, lowStockThreshold: 10, supplier: 'Sony', createdBy: staff._id },
    { name: 'Nike Air Max 270', sku: 'CLTH-001', category: 'Clothing', price: 150, costPrice: 60, quantity: 200, lowStockThreshold: 30, supplier: 'Nike', createdBy: admin._id },
    { name: 'Adidas Ultraboost', sku: 'CLTH-002', category: 'Clothing', price: 180, costPrice: 75, quantity: 5, lowStockThreshold: 20, supplier: 'Adidas', createdBy: staff._id },
    { name: 'Ergonomic Office Chair', sku: 'FURN-001', category: 'Furniture', price: 459, costPrice: 220, quantity: 30, lowStockThreshold: 5, supplier: 'Herman Miller', createdBy: admin._id },
    { name: 'Standing Desk', sku: 'FURN-002', category: 'Furniture', price: 799, costPrice: 400, quantity: 15, lowStockThreshold: 3, supplier: 'FlexiSpot', createdBy: admin._id },
    { name: 'Protein Powder 5lb', sku: 'HLTH-001', category: 'Healthcare', price: 65, costPrice: 28, quantity: 300, lowStockThreshold: 50, supplier: 'Optimum Nutrition', createdBy: staff._id },
    { name: 'Yoga Mat Premium', sku: 'SPRT-001', category: 'Sports', price: 89, costPrice: 35, quantity: 75, lowStockThreshold: 15, supplier: 'Lululemon', createdBy: admin._id },
  ]);

  console.log('✅ Products created');

  // Create transactions
  const txns = [];
  for (const p of products) {
    if (p.quantity > 0) {
      txns.push({
        product: p._id,
        type: 'stock_in',
        quantity: p.quantity,
        previousQuantity: 0,
        newQuantity: p.quantity,
        reason: 'Initial stock',
        performedBy: admin._id,
      });
    }
  }
  // Add some stock_out transactions
  txns.push(
    { product: products[1]._id, type: 'stock_out', quantity: 10, previousQuantity: 130, newQuantity: 120, reason: 'Order #1001', performedBy: staff._id },
    { product: products[4]._id, type: 'stock_out', quantity: 15, previousQuantity: 215, newQuantity: 200, reason: 'Order #1002', performedBy: staff._id },
    { product: products[2]._id, type: 'stock_in', quantity: 8, previousQuantity: 0, newQuantity: 8, reason: 'Restock', performedBy: admin._id },
  );
  await StockTransaction.insertMany(txns);

  console.log('✅ Transactions created');
  console.log('\n🎉 Seed complete!');
  console.log('📧 Admin: admin@inventory.com / admin123');
  console.log('📧 Staff: staff@inventory.com / staff123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });