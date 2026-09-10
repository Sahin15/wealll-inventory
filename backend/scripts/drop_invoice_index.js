require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory');
    console.log('Connected to DB');
    
    // Drop the specific index
    try {
      await mongoose.connection.collection('purchases').dropIndex('tenantId_1_invoiceNumber_1');
      console.log('Successfully dropped index tenantId_1_invoiceNumber_1');
    } catch (e) {
      console.log('Index might not exist or already dropped:', e.message);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

run();
