require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Tenant = require('../src/models/Tenant');
const User = require('../src/models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Check if demo tenant exists
    let tenant = await Tenant.findOne({ email: 'hello@wealll.com' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'WeAlll Demo Makeup Studio',
        businessName: 'WeAlll Demo Makeup Studio',
        email: 'hello@wealll.com',
        phone: '1234567890'
      });
      console.log('Tenant created');
    } else {
      console.log('Tenant already exists');
    }

    // Check if admin user exists
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      const passwordHash = await bcrypt.hash('admin123', 10); // Development only
      admin = await User.create({
        tenantId: tenant._id,
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
