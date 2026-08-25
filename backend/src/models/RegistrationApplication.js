const mongoose = require('mongoose');

const registrationApplicationSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  businessEmail: { type: String, required: true },
  businessPhone: { type: String, required: true },
  businessAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  gstin: { type: String },

  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  applicantPhone: { type: String, required: true },
  passwordHash: { type: String, required: true },

  expectedProductCount: { type: String },
  expectedUserCount: { type: String },
  currentlyUsingExcel: { type: Boolean, default: false },
  referralSource: { type: String },

  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RegistrationApplication', registrationApplicationSchema);
