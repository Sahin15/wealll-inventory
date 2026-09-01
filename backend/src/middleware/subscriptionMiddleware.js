const Subscription = require('../models/Subscription');

exports.requireActiveSubscription = async (req, res, next) => {
  try {
    // SuperAdmins bypass this check
    if (req.user.role === 'superadmin') {
      return next();
    }

    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, error: 'No tenant ID found' });
    }

    const subscription = await Subscription.findOne({ tenantId });
    
    if (!subscription) {
      // Legacy tenants without a subscription record can pass, or we could block them. 
      // For safety, allow legacy tenants.
      return next();
    }

    // Auto-expire trials
    if (subscription.status === 'TRIAL' && subscription.trialEndDate && new Date() > subscription.trialEndDate) {
      subscription.status = 'EXPIRED';
      await subscription.save();
    }

    if (['EXPIRED', 'CANCELLED', 'SUSPENDED'].includes(subscription.status)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Subscription Expired', 
        code: 'SUBSCRIPTION_EXPIRED',
        status: subscription.status
      });
    }

    next();
  } catch (error) {
    console.error('Subscription Middleware Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
