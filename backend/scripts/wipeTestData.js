const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Sale = require('../src/models/Sale');
const Purchase = require('../src/models/Purchase');
const ClassBatch = require('../src/models/ClassBatch');
const RegistrationApplication = require('../src/models/RegistrationApplication');
const Payment = require('../src/models/Payment');
const StockMovement = require('../src/models/StockMovement');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wealll_inventory';

async function wipeTestData() {
  const tenantId = '6a96c38ab3ce90bd87bd3e23'; // Joyita Das

  await mongoose.connect(MONGODB_URI);
  console.log(`Wiping test data for Tenant ID: ${tenantId}`);

  const collections = [
    { name: 'Products', model: Product },
    { name: 'Categories', model: Category },
    { name: 'Sales', model: Sale },
    { name: 'Purchases', model: Purchase },
    { name: 'ClassBatches', model: ClassBatch },
    { name: 'RegistrationApplications', model: RegistrationApplication },
    { name: 'Payments', model: Payment },
    { name: 'StockMovements', model: StockMovement },
  ];

  for (const { name, model } of collections) {
    try {
      const result = await model.deleteMany({ tenantId });
      console.log(`${name} deleted: ${result.deletedCount}`);
    } catch (err) {
      console.log(`Failed to delete ${name}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
}

wipeTestData();
