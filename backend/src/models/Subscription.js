const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  status: { type: String, enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'], default: 'TRIAL' },
  startDate: { type: Date },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  cancelledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
