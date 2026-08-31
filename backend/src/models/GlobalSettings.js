const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  announcementText: { type: String, default: '' },
  defaultTaxRate: { type: Number, default: 0 },
  platformName: { type: String, default: 'WeAlll Inventory' },
  supportEmail: { type: String, default: 'support@wealll.com' }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
