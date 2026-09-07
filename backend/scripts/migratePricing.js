const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Purchase = require('../src/models/Purchase');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wealll_inventory';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Migrate Products: rename sellingPrice to mrp
    const productUpdateResult = await Product.collection.updateMany(
      { sellingPrice: { $exists: true } },
      { $rename: { 'sellingPrice': 'mrp' } }
    );
    console.log(`Migrated Products: ${productUpdateResult.modifiedCount} documents updated.`);

    // 2. Migrate Purchases: rename items.purchasePrice to items.unitCost
    const purchases = await Purchase.find({});
    let purchaseUpdateCount = 0;
    
    for (const purchase of purchases) {
      let modified = false;
      for (const item of purchase.items) {
        if (item._doc.purchasePrice !== undefined) {
          item.unitCost = item._doc.purchasePrice;
          item._doc.purchasePrice = undefined; 
          modified = true;
        }
      }
      
      if (modified) {
        // We use Mongoose's update to avoid validation schema issues with undefined fields
        await Purchase.collection.updateOne(
          { _id: purchase._id },
          { $set: { items: purchase.items.map(i => ({
             productId: i.productId,
             quantity: i.quantity,
             unitCost: i.unitCost || i._doc.purchasePrice,
             total: i.total
          })) } }
        );
        purchaseUpdateCount++;
      }
    }
    console.log(`Migrated Purchases: ${purchaseUpdateCount} documents updated.`);

    // 3. Migrate Sales: copy sellingPrice to mrp for history
    const Sale = require('../src/models/Sale');
    const sales = await Sale.find({});
    let saleUpdateCount = 0;
    for (const sale of sales) {
      let modified = false;
      for (const item of sale.items) {
        if (item.mrp === undefined && item.sellingPrice !== undefined) {
          item.mrp = item.sellingPrice;
          modified = true;
        }
      }
      if (modified) {
        await Sale.collection.updateOne(
          { _id: sale._id },
          { $set: { items: sale.items.map(i => ({
             productId: i.productId,
             quantity: i.quantity,
             mrp: i.mrp || i.sellingPrice,
             sellingPrice: i.sellingPrice,
             total: i.total
          })) } }
        );
        saleUpdateCount++;
      }
    }
    console.log(`Migrated Sales: ${saleUpdateCount} documents updated.`);

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
