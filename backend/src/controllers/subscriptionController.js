const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

exports.getCurrentSubscription = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const plans = await SubscriptionPlan.find({ isActive: true });
    
    const subscription = await Subscription.findOne({ tenantId }).populate('planId');
    
    // Allow returning null subscription to gracefully handle legacy tenants without subscriptions
    // or those whose subscriptions haven't been created yet.

    res.json({ 
      success: true, 
      data: {
        subscription,
        plans
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
