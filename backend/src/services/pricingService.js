const GlobalSettings = require('../models/GlobalSettings');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { calculateAnnualPricing } = require('../utils/pricingUtils');

async function getOrCreateGlobalSettings() {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = await GlobalSettings.create({});
  }
  return settings;
}

function buildPricingConfig(settings) {
  const s = settings?.toObject ? settings.toObject() : settings || {};
  return {
    annualDiscountPercentage: s.annualDiscountPercentage ?? 20,
    freeTrialDays: s.freeTrialDays ?? 14,
    currency: s.currency || 'INR',
    isYearlyBillingEnabled: s.isYearlyBillingEnabled !== false,
    isMonthlyBillingEnabled: s.isMonthlyBillingEnabled !== false,
  };
}

function enrichPlanWithPricing(plan, pricingConfig) {
  if (!plan) return null;
  const obj = plan.toObject ? plan.toObject() : { ...plan };
  const monthlyPrice = Number(obj.monthlyPrice) || 0;
  const annual = calculateAnnualPricing(monthlyPrice, pricingConfig.annualDiscountPercentage);

  return {
    ...obj,
    yearlyPrice: annual.discountedAnnualPrice,
    pricing: {
      currency: pricingConfig.currency,
      monthlyPrice,
      billing: {
        monthly: {
          amount: monthlyPrice,
          label: 'month',
        },
        yearly: {
          ...annual,
          amount: annual.discountedAnnualPrice,
          label: 'year',
        },
      },
    },
  };
}

async function syncAllPlanYearlyPrices(pricingConfig) {
  const plans = await SubscriptionPlan.find({});
  await Promise.all(
    plans.map(async (plan) => {
      const annual = calculateAnnualPricing(plan.monthlyPrice, pricingConfig.annualDiscountPercentage);
      plan.yearlyPrice = annual.discountedAnnualPrice;
      await plan.save();
    })
  );
}

async function getActivePublicPlans() {
  return SubscriptionPlan.find({ isActive: true, monthlyPrice: { $gt: 0 } })
    .sort({ displayOrder: 1, monthlyPrice: 1 });
}

async function getPublicPricingPayload() {
  const settings = await getOrCreateGlobalSettings();
  const pricingConfig = buildPricingConfig(settings);
  const plans = await getActivePublicPlans();

  return {
    config: pricingConfig,
    plans: plans.map((plan) => enrichPlanWithPricing(plan, pricingConfig)),
  };
}

module.exports = {
  getOrCreateGlobalSettings,
  buildPricingConfig,
  enrichPlanWithPricing,
  syncAllPlanYearlyPrices,
  getActivePublicPlans,
  getPublicPricingPayload,
};
