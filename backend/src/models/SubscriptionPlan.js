const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  monthlyPrice: { type: Number, required: true, min: 0 },
  yearlyPrice: { type: Number, default: 0 },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isRecommended: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  badgeText: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', planSchema);
