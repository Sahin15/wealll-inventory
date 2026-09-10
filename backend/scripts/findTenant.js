const mongoose = require('mongoose');
const Tenant = require('../src/models/Tenant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wealll_inventory';

async function findTenant() {
  await mongoose.connect(MONGODB_URI);
  const tenants = await Tenant.find({});
  console.log("Found tenants:");
  tenants.forEach(t => console.log(`- ${t.name} (ID: ${t._id})`));
  await mongoose.disconnect();
}
findTenant();
