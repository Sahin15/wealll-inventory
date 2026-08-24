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
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
