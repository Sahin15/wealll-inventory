const Tenant = require('../models/Tenant');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    
    // Map to include studioName alias for the frontend
    const formattedTenants = tenants.map(t => ({
      ...t.toObject(),
      studioName: t.businessName
    }));

    res.json({ success: true, data: formattedTenants });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const { studioName, adminName, adminEmail, adminPassword } = req.body;

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Create the Tenant
    const tenant = await Tenant.create({
      name: adminName,
      businessName: studioName,
      email: adminEmail,
      status: 'active'
    });

    // Create the initial Admin User for the Tenant
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await User.create({
      tenantId: tenant._id,
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });

    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
