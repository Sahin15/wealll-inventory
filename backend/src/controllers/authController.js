const User = require('../models/User');
const RegistrationApplication = require('../models/RegistrationApplication');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId, tenantId, role) => {
  return jwt.sign({ userId, tenantId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const {
      businessName, businessType, businessEmail, businessPhone, businessAddress,
      city, state, pinCode, gstin,
      applicantName, applicantEmail, applicantPhone,
      password, expectedProductCount, expectedUserCount, currentlyUsingExcel, referralSource
    } = req.body;

    if (!businessName || !businessType || !businessEmail || !businessPhone || !businessAddress ||
        !city || !state || !pinCode || !applicantName || !applicantEmail || !applicantPhone || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    // Check if email already exists in User
    const existingUser = await User.findOne({ email: applicantEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Check if pending application already exists
    const existingApp = await RegistrationApplication.findOne({ applicantEmail });
    if (existingApp && existingApp.status === 'PENDING') {
      return res.status(400).json({ success: false, error: 'An application is already pending for this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const application = await RegistrationApplication.create({
      businessName, businessType, businessEmail, businessPhone, businessAddress,
      city, state, pinCode, gstin,
      applicantName, applicantEmail, applicantPhone,
      passwordHash,
      expectedProductCount, expectedUserCount, currentlyUsingExcel, referralSource,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: { applicationId: application._id } });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email })
      .select('+passwordHash')
      .populate('tenantId', 'appName logoUrl businessName ownerName businessPhone businessAddress brandColor');
    
    if (!user) {
      // Check for pending or rejected application
      const app = await RegistrationApplication.findOne({ applicantEmail: email }).sort({ createdAt: -1 });
      if (app) {
        if (app.status === 'PENDING') {
          return res.status(403).json({ success: false, error: 'Your WeAlll Inventory application is still awaiting approval. You will be able to access the system once your application has been approved.' });
        }
        if (app.status === 'REJECTED') {
          return res.status(403).json({ success: false, error: `Your application was rejected. Reason: ${app.rejectionReason || 'Contact support'}` });
        }
      }
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'User account is inactive' });
    }

    const token = generateToken(user._id, user.tenantId._id, user.role);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId, // Now populated with appName and logoUrl
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-passwordHash')
      .populate('tenantId', 'appName logoUrl businessName ownerName businessPhone businessAddress brandColor');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  // Client is responsible for deleting the token
  res.json({ success: true, data: {} });
};
