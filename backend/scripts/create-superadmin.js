require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'superadmin@wealll.com';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Super admin already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('wealll2026', salt);

    await User.create({
      name: 'WeAlll Admin',
      email,
      passwordHash,
      role: 'superadmin',
      // No tenantId needed because it's optional now
    });

    console.log('Super Admin successfully created!');
    console.log('Email: superadmin@wealll.com');
    console.log('Password: wealll2026');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
