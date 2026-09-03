require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Sale = require('./src/models/Sale');
const StockMovement = require('./src/models/StockMovement');
const ClassBatch = require('./src/models/ClassBatch');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  try {
    const tenantId = null; // Try with null or a random objectId
    await Promise.all([
      Product.countDocuments({ tenantId }),
      Product.find({ tenantId }),
      Sale.find({ tenantId }),
      StockMovement.find({ tenantId }).sort({ createdAt: -1 }).limit(5).populate('productId', 'name sku'),
      Sale.find({ tenantId }).sort({ createdAt: -1 }).limit(5),
      ClassBatch.find({ tenantId }).sort({ date: 1 })
    ]);
    console.log('Success');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}
run();
