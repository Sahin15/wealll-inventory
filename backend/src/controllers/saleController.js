const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

exports.getSales = async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    if (req.query.studentId) filter.studentId = req.query.studentId;
    
    const sales = await Sale.find(filter)
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNumber, saleDate, customerName, studentId, classBatchId, items, subtotal, discount, total, paymentStatus, notes } = req.body;

    const sale = new Sale({
      tenantId: req.user.tenantId,
      invoiceNumber, saleDate, customerName, studentId, classBatchId, items, subtotal, discount, total, paymentStatus, notes,
      createdBy: req.user.userId
    });

    await sale.save({ session });

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId }).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      product.currentStock -= item.quantity;
      await product.save({ session });

      const movement = new StockMovement({
        tenantId: req.user.tenantId,
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantity,
        referenceType: 'SALE',
        referenceId: sale._id,
        note: `Sale to ${customerName || 'Walk-in'}, Invoice: ${invoiceNumber}`,
        createdBy: req.user.userId
      });
      await movement.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Invoice number already exists for this tenant' });
    }
    res.status(400).json({ success: false, error: error.message || 'Error creating sale' });
  }
};

exports.voidSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { voidReason } = req.body;
    if (!voidReason) return res.status(400).json({ success: false, error: 'Void reason is required' });

    const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).session(session);
    if (!sale) throw new Error('Sale not found');
    if (sale.status === 'VOIDED') throw new Error('This transaction has already been voided.');

    for (const item of sale.items) {
      const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId }).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      product.currentStock += item.quantity;
      await product.save({ session });

      const movement = new StockMovement({
        tenantId: req.user.tenantId,
        productId: item.productId,
        type: 'IN',
        quantity: item.quantity,
        referenceType: 'SALE_VOID',
        referenceId: sale._id,
        note: `Voided Sale to ${sale.customerName || 'Walk-in'}, Invoice: ${sale.invoiceNumber} - Reason: ${voidReason}`,
        createdBy: req.user.userId
      });
      await movement.save({ session });
    }

    sale.status = 'VOIDED';
    sale.voidedAt = new Date();
    sale.voidedBy = req.user.userId;
    sale.voidReason = voidReason;
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, data: sale });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: error.message || 'Error voiding sale' });
  }
};
