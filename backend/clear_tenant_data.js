require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Tenant = require('./src/models/Tenant');
const Category = require('./src/models/Category');
const ClassBatch = require('./src/models/ClassBatch');
const Payment = require('./src/models/Payment');
const Product = require('./src/models/Product');
const Purchase = require('./src/models/Purchase');
const Sale = require('./src/models/Sale');
const StockMovement = require('./src/models/StockMovement');

async function clearTenantData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const tenant = await Tenant.findOne({ businessName: { $regex: /joyita makeover/i } });
    if (!tenant) {
      console.log('Tenant "Joyita Makeover" not found');
      return;
    }

    const tenantId = tenant._id;
    console.log(`Found tenant: ${tenant.businessName} (ID: ${tenantId})`);

    const resultCategories = await Category.deleteMany({ tenantId });
    console.log(`Deleted ${resultCategories.deletedCount} categories`);

    const resultClassBatches = await ClassBatch.deleteMany({ tenantId });
    console.log(`Deleted ${resultClassBatches.deletedCount} class batches`);

    const resultPayments = await Payment.deleteMany({ tenantId });
    console.log(`Deleted ${resultPayments.deletedCount} payments`);

    const resultProducts = await Product.deleteMany({ tenantId });
    console.log(`Deleted ${resultProducts.deletedCount} products`);

    const resultPurchases = await Purchase.deleteMany({ tenantId });
    console.log(`Deleted ${resultPurchases.deletedCount} purchases`);

    const resultSales = await Sale.deleteMany({ tenantId });
    console.log(`Deleted ${resultSales.deletedCount} sales`);

    const resultStockMovements = await StockMovement.deleteMany({ tenantId });
    console.log(`Deleted ${resultStockMovements.deletedCount} stock movements`);

    console.log('Successfully cleared dummy data for Joyita Makeovers.');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

clearTenantData();
