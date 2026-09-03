const Tenant = require('../models/Tenant');
const User = require('../models/User');
const RegistrationApplication = require('../models/RegistrationApplication');
const GlobalSettings = require('../models/GlobalSettings');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const bcrypt = require('bcryptjs');

exports.getGlobalSettings = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }
    
    const allowedFields = ['maintenanceMode', 'announcementText', 'defaultTaxRate', 'platformName', 'supportEmail', 'freeTrialDays'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

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

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }
    
    // Also fetch the admin user for this tenant
    const adminUser = await User.findOne({ tenantId: tenant._id, role: 'admin' });

    res.json({ 
      success: true, 
      data: {
        ...tenant.toObject(),
        adminName: adminUser ? adminUser.name : '',
        adminEmail: adminUser ? adminUser.email : ''
      } 
    });
  } catch (error) {
    console.error('Error fetching tenant details:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    const {
      businessName, businessType, email, phone, businessPhone, 
      businessAddress, city, state, pinCode, gstin
    } = req.body;

    if (businessName !== undefined) tenant.businessName = businessName;
    if (businessType !== undefined) tenant.businessType = businessType;
    if (email !== undefined) tenant.email = email;
    if (phone !== undefined) tenant.phone = phone;
    if (businessPhone !== undefined) tenant.businessPhone = businessPhone;
    if (businessAddress !== undefined) tenant.businessAddress = businessAddress;
    if (city !== undefined) tenant.city = city;
    if (state !== undefined) tenant.state = state;
    if (pinCode !== undefined) tenant.pinCode = pinCode;
    if (gstin !== undefined) tenant.gstin = gstin;

    await tenant.save();

    res.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error updating tenant:', error.stack);
    res.status(500).json({ success: false, error: error.stack || 'Server Error' });
  }
};

exports.updateTenantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    tenant.status = status;
    await tenant.save();

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const { 
      studioName, adminName, adminEmail, adminPassword,
      businessType, businessPhone, businessAddress, city, state, pinCode, gstin
    } = req.body;

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Create the Tenant
    const tenant = await Tenant.create({
      name: adminName,
      businessName: studioName,
      email: adminEmail,
      status: 'active',
      businessType,
      businessPhone,
      businessAddress,
      city,
      state,
      pinCode,
      gstin
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

    // Create a free trial subscription based on global settings
    const settings = await GlobalSettings.findOne() || {};
    const trialDays = settings.freeTrialDays || 14;

    const starterPlan = await SubscriptionPlan.findOne({ slug: 'starter' });
    if (starterPlan) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + trialDays);
      
      await Subscription.create({
        tenantId: tenant._id,
        planId: starterPlan._id,
        status: 'TRIAL',
        billingCycle: 'monthly',
        trialStartDate: new Date(),
        trialEndDate: trialEnd,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEnd
      });
    }

    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await RegistrationApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const app = await RegistrationApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    if (app.status === 'APPROVED') {
      return res.status(400).json({ success: false, error: 'Application is already approved' });
    }

    // Check if email already exists in User
    const existingUser = await User.findOne({ email: app.applicantEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email is already in use by an active user' });
    }

    // Safely create tenant and user
    const tenant = await Tenant.create({
      name: app.applicantName,
      businessName: app.businessName,
      email: app.businessEmail,
      phone: app.applicantPhone,
      businessPhone: app.businessPhone,
      businessAddress: app.businessAddress,
      status: 'active'
    });

    await User.create({
      tenantId: tenant._id,
      name: app.applicantName,
      email: app.applicantEmail,
      passwordHash: app.passwordHash,
      role: 'admin',
      status: 'active'
    });

    // Create a free trial subscription based on global settings
    const settings = await GlobalSettings.findOne() || {};
    const trialDays = settings.freeTrialDays || 7;

    const starterPlan = await SubscriptionPlan.findOne({ slug: 'starter' });
    if (starterPlan) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + trialDays);
      
      await Subscription.create({
        tenantId: tenant._id,
        planId: starterPlan._id,
        status: 'TRIAL',
        billingCycle: 'monthly',
        trialStartDate: new Date(),
        trialEndDate: trialEnd,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEnd
      });
    }

    app.status = 'APPROVED';
    app.reviewedBy = req.user.userId;
    app.reviewedAt = Date.now();
    await app.save();

    res.json({ success: true, data: app });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, error: 'Please provide a rejection reason' });
    }

    const app = await RegistrationApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    if (app.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Only pending applications can be rejected' });
    }

    app.status = 'REJECTED';
    app.rejectionReason = rejectionReason;
    app.reviewedBy = req.user.userId;
    app.reviewedAt = Date.now();
    await app.save();

    res.json({ success: true, data: app });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getTenantSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ tenantId: req.params.id }).populate('planId');
    const plans = await SubscriptionPlan.find({ isActive: true });
    
    res.json({ success: true, data: { subscription, plans } });
  } catch (error) {
    console.error('Error fetching tenant subscription:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

exports.updateTenantSubscription = async (req, res) => {
  try {
    const { status, planId, billingCycle, extensionDays, currentPeriodStart, currentPeriodEnd } = req.body;
    let subscription = await Subscription.findOne({ tenantId: req.params.id });

    if (!subscription) {
      const defaultPlan = await SubscriptionPlan.findOne({ isRecommended: true }) || await SubscriptionPlan.findOne();
      const settings = await GlobalSettings.findOne() || {};
      const trialDays = settings.freeTrialDays || 7;
      
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + trialDays);

      subscription = new Subscription({
        tenantId: req.params.id,
        planId: defaultPlan?._id,
        status: 'TRIAL',
        billingCycle: 'monthly',
        currentPeriodStart: start,
        currentPeriodEnd: end
      });
    }

    if (status) subscription.status = status;
    if (planId) {
      subscription.planId = planId;
    } else if (!subscription.planId) {
      // Fix for legacy tenants without a plan
      const defaultPlan = await SubscriptionPlan.findOne({ isRecommended: true }) || await SubscriptionPlan.findOne();
      if (defaultPlan) subscription.planId = defaultPlan._id;
    }
    
    if (billingCycle) subscription.billingCycle = billingCycle;
    if (currentPeriodStart) subscription.currentPeriodStart = new Date(currentPeriodStart);
    if (currentPeriodEnd) {
      subscription.currentPeriodEnd = new Date(currentPeriodEnd);
      if(subscription.status === 'EXPIRED' && subscription.currentPeriodEnd > new Date()) {
        subscription.status = 'ACTIVE';
      }
    }

    if (extensionDays) {
      // Create a NEW Date object so Mongoose detects the change
      const currentEnd = new Date(subscription.currentPeriodEnd || new Date());
      currentEnd.setDate(currentEnd.getDate() + extensionDays);
      subscription.currentPeriodEnd = currentEnd;
      if(subscription.status === 'EXPIRED') {
        subscription.status = 'ACTIVE';
      }
    }

    await subscription.save();
    
    // Repopulate plan details for return
    subscription = await Subscription.findById(subscription._id).populate('planId');
    
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    if (req.body.isRecommended) {
      await SubscriptionPlan.updateMany({}, { isRecommended: false });
    }
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    if (req.body.isRecommended) {
      await SubscriptionPlan.updateMany({ _id: { $ne: req.params.id } }, { isRecommended: false });
    }
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

