const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  announcementText: { type: String, default: '' },
  defaultTaxRate: { type: Number, default: 0 },
  platformName: { type: String, default: 'WeAlll Inventory' },
  supportEmail: { type: String, default: 'support@wealll.com' },
  freeTrialDays: { type: Number, default: 14 },
  annualDiscountPercentage: { type: Number, default: 20, min: 0, max: 100 },
  currency: { type: String, default: 'INR' },
  isMonthlyBillingEnabled: { type: Boolean, default: true },
  isYearlyBillingEnabled: { type: Boolean, default: true },
  pricingUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
