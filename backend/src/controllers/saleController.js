const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNumber, saleDate, customerName, items, subtotal, discount, total, paymentStatus, notes } = req.body;

    const sale = new Sale({
      tenantId: req.user.tenantId,
      invoiceNumber, saleDate, customerName, items, subtotal, discount, total, paymentStatus, notes,
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
