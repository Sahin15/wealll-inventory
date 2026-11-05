const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const {
  getOrCreateGlobalSettings,
  buildPricingConfig,
  enrichPlanWithPricing,
} = require('../services/pricingService');
const { resolvePlanChargeAmount } = require('../utils/pricingUtils');

exports.getCurrentSubscription = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const settings = await getOrCreateGlobalSettings();
    const pricingConfig = buildPricingConfig(settings);

    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ displayOrder: 1, monthlyPrice: 1 });
    const subscription = await Subscription.findOne({ tenantId }).populate('planId');

    const enrichedPlans = plans.map((plan) => enrichPlanWithPricing(plan, pricingConfig));
    const enrichedSubscription = subscription
      ? {
          ...subscription.toObject(),
          planId: enrichPlanWithPricing(subscription.planId, pricingConfig),
        }
      : null;

    res.json({
      success: true,
      data: {
        subscription: enrichedSubscription,
        plans: enrichedPlans,
        pricingConfig,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getSubscriptionQuote = async (req, res) => {
  try {
    const { planId, billingCycle = 'monthly' } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan is required.' });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ success: false, error: 'Invalid billing cycle.' });
    }

    const settings = await getOrCreateGlobalSettings();
    const pricingConfig = buildPricingConfig(settings);

    if (billingCycle === 'monthly' && !pricingConfig.isMonthlyBillingEnabled) {
      return res.status(400).json({ success: false, error: 'Monthly billing is currently unavailable.' });
    }

    if (billingCycle === 'yearly' && !pricingConfig.isYearlyBillingEnabled) {
      return res.status(400).json({ success: false, error: 'Yearly billing is currently unavailable.' });
    }

    const plan = await SubscriptionPlan.findOne({ _id: planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found or inactive.' });
    }

    const enrichedPlan = enrichPlanWithPricing(plan, pricingConfig);
    const amount = resolvePlanChargeAmount(plan, billingCycle, pricingConfig);

    res.json({
      success: true,
      data: {
        planId: plan._id,
        planName: plan.name,
        billingCycle,
        amount,
        currency: pricingConfig.currency,
        pricingConfig,
        plan: enrichedPlan,
      },
    });
  } catch (error) {
    console.error('Error creating subscription quote:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
