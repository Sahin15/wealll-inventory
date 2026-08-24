const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String },
  address: { type: String },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  attended: { type: Boolean, default: false },
  enrolledAt: { type: Date, default: Date.now }
});

const classBatchSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  batchNumber: { type: String, required: true },
  topic: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  seatPrice: { type: Number, required: true, min: 0 },
  students: [studentSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure batch numbers are unique per tenant
classBatchSchema.index({ tenantId: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model('ClassBatch', classBatchSchema);
