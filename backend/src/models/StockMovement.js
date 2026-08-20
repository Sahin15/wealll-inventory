const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  referenceType: { type: String, enum: ['PURCHASE', 'SALE', 'MANUAL'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
