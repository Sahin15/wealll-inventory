const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  monthlyPrice: { type: Number, required: true },
  yearlyPrice: { type: Number, required: true },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isRecommended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', planSchema);
