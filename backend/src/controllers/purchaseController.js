const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ tenantId: req.user.tenantId })
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { supplierName, invoiceNumber, purchaseDate, items, subtotal, discount, total, notes } = req.body;

    const purchase = new Purchase({
      tenantId: req.user.tenantId,
      supplierName, invoiceNumber, purchaseDate, items, subtotal, discount, total, notes,
      createdBy: req.user.userId
    });

    await purchase.save({ session });

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId }).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      product.currentStock += item.quantity;
      await product.save({ session });

      const movement = new StockMovement({
        tenantId: req.user.tenantId,
        productId: item.productId,
        type: 'IN',
        quantity: item.quantity,
        referenceType: 'PURCHASE',
        referenceId: purchase._id,
        note: `Purchase from ${supplierName}, Invoice: ${invoiceNumber}`,
        createdBy: req.user.userId
      });
      await movement.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Invoice number already exists for this tenant' });
    }
    res.status(400).json({ success: false, error: error.message || 'Error creating purchase' });
  }
};

exports.voidPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { voidReason } = req.body;
    if (!voidReason) return res.status(400).json({ success: false, error: 'Void reason is required' });

    const purchase = await Purchase.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).session(session);
    if (!purchase) throw new Error('Purchase not found');
    if (purchase.status === 'VOIDED') throw new Error('This transaction has already been voided.');

    for (const item of purchase.items) {
      const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId }).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      product.currentStock -= item.quantity;
      await product.save({ session });

      const movement = new StockMovement({
        tenantId: req.user.tenantId,
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantity,
        referenceType: 'PURCHASE_VOID',
        referenceId: purchase._id,
        note: `Voided Purchase from ${purchase.supplierName}, Invoice: ${purchase.invoiceNumber} - Reason: ${voidReason}`,
        createdBy: req.user.userId
      });
      await movement.save({ session });
    }

    purchase.status = 'VOIDED';
    purchase.voidedAt = new Date();
    purchase.voidedBy = req.user.userId;
    purchase.voidReason = voidReason;
    await purchase.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, data: purchase });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: error.message || 'Error voiding purchase' });
  }
};
