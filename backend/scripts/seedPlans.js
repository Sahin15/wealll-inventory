require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for new makeup artists or small studios just getting started.',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    features: [
      'Up to 100 Products',
      'Basic Analytics',
      '1 Admin User',
      'Standard Support'
    ],
    isActive: true
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'Ideal for growing businesses needing more capacity and features.',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    features: [
      'Unlimited Products',
      'Advanced Analytics',
      'Up to 5 Team Members',
      'Priority Email Support',
      'Custom Branding'
    ],
    isActive: true
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'For established salons and retail businesses with large teams.',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    features: [
      'Unlimited Products & Categories',
      'Full Reporting Suite',
      'Unlimited Team Members',
      'White-label Experience',
      '24/7 Phone Support',
      'Dedicated Account Manager'
    ],
    isActive: true
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wealll_inventory');
    console.log('Connected to MongoDB');

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing plans');

    // Insert new plans
    await SubscriptionPlan.insertMany(plans);
    console.log('Successfully seeded subscription plans');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
