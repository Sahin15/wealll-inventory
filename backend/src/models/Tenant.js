const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  ownerName: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  businessPhone: { type: String },
  businessAddress: { type: String },
  taxRate: { type: Number, default: 0 },
  invoiceHeaderText: { type: String },
  invoiceFooterText: { type: String, default: "Thank you for your business!" },
  appName: { type: String, default: "WeAlll Inventory" },
  logoUrl: { type: String },
  brandColor: { type: String, default: '#000000' },
  businessType: { type: String },
  city: { type: String },
  state: { type: String },
  pinCode: { type: String },
  gstin: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  tenantCode: { type: String, unique: true }
}, { timestamps: true });

tenantSchema.pre('save', function (next) {
  if (!this.tenantCode) {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.tenantCode = `WL-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);
