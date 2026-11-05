require('dotenv').config();
const mongoose = require('mongoose');
const GlobalSettings = require('../src/models/GlobalSettings');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');
const { calculateAnnualPricing } = require('../src/utils/pricingUtils');

const PAID_PLANS = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for new businesses getting started with inventory and sales.',
    monthlyPrice: 299,
    displayOrder: 1,
    features: [
      'Up to 100 Products',
      'Basic Analytics',
      '1 Admin User',
      'Standard Support',
    ],
    isActive: true,
    isRecommended: false,
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'Ideal for growing businesses needing more capacity and features.',
    monthlyPrice: 499,
    displayOrder: 2,
    features: [
      'Unlimited Products',
      'Advanced Analytics',
      'Up to 5 Team Members',
      'Priority Email Support',
      'Custom Branding',
    ],
    isActive: true,
    isRecommended: true,
    badgeText: 'Most Popular',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'For established businesses with larger teams and operations.',
    monthlyPrice: 899,
    displayOrder: 3,
    features: [
      'Unlimited Products & Categories',
      'Full Reporting Suite',
      'Unlimited Team Members',
      'White-label Experience',
      '24/7 Phone Support',
      'Dedicated Account Manager',
    ],
    isActive: true,
    isRecommended: false,
  },
];

async function seedSubscriptionPricing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wealll_inventory');
    console.log('Connected to MongoDB');

    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }

    settings.freeTrialDays = settings.freeTrialDays ?? 14;
    settings.annualDiscountPercentage = settings.annualDiscountPercentage ?? 20;
    settings.currency = settings.currency || 'INR';
    settings.isMonthlyBillingEnabled = settings.isMonthlyBillingEnabled !== false;
    settings.isYearlyBillingEnabled = settings.isYearlyBillingEnabled !== false;
    await settings.save();

    const discount = settings.annualDiscountPercentage;

    for (const planDef of PAID_PLANS) {
      const annual = calculateAnnualPricing(planDef.monthlyPrice, discount);
      await SubscriptionPlan.findOneAndUpdate(
        { slug: planDef.slug },
        {
          ...planDef,
          yearlyPrice: annual.discountedAnnualPrice,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Upserted plan: ${planDef.slug} (₹${planDef.monthlyPrice}/mo)`);
    }

    await SubscriptionPlan.updateMany({ slug: 'free' }, { isActive: false });

    console.log('Subscription pricing seed complete.');
    process.exit(0);
  } catch (error) {
    console.error('Subscription pricing seed failed:', error);
    process.exit(1);
  }
}

seedSubscriptionPricing();
