require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      if (collection.collectionName === 'users') {
        await collection.deleteMany({ role: { $ne: 'superadmin' } });
        console.log('Cleared non-superadmin users');
      } else if (collection.collectionName !== 'globalsettings' && collection.collectionName !== 'subscriptionplans') {
        await collection.deleteMany({});
        console.log(`Cleared ${collection.collectionName}`);
      }
    }
    console.log('Database cleaned! Only superadmin remains.');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
}).catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
});
