const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

exports.getSales = async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    if (req.query.studentId) filter.studentId = req.query.studentId;
    
    const sales = await Sale.find(filter)
      .populate('items.productId', 'name unit categoryId')
      .populate('payments.recordedBy', 'name')
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
    const { 
      invoiceNumber, 
      saleDate, 
      customerName, 
      studentId, 
      classBatchId, 
      items, 
      subtotal, 
      discount, 
      total, 
      paymentStatus = 'PAID', 
      paymentMethod = 'CASH',
      paidAmount: inputPaidAmount, 
      notes 
    } = req.body;

    const numTotal = Number(total) || 0;
    let finalPaidAmount = 0;
    let finalPaymentStatus = paymentStatus;

    if (paymentStatus === 'PAID') {
      finalPaidAmount = numTotal;
    } else if (paymentStatus === 'PENDING') {
      finalPaidAmount = 0;
    } else if (paymentStatus === 'PARTIAL') {
      const parsed = Number(inputPaidAmount) || 0;
      finalPaidAmount = Math.max(0, Math.min(numTotal, parsed));
      if (finalPaidAmount >= numTotal && numTotal > 0) {
        finalPaymentStatus = 'PAID';
      } else if (finalPaidAmount <= 0) {
        finalPaymentStatus = 'PENDING';
      }
    }

    const finalDueAmount = Math.max(0, numTotal - finalPaidAmount);

    const initialPayments = [];
    if (finalPaidAmount > 0) {
      initialPayments.push({
        amount: finalPaidAmount,
        paymentDate: saleDate ? new Date(saleDate) : new Date(),
        paymentMethod: paymentMethod || 'CASH',
        notes: notes || 'Initial Payment',
        recordedBy: req.user.userId
      });
    }

    const sale = new Sale({
      tenantId: req.user.tenantId,
      invoiceNumber,
      saleDate: saleDate || new Date(),
      customerName,
      studentId: studentId || null,
      classBatchId: classBatchId || null,
      items,
      subtotal,
      discount: discount || 0,
      total: numTotal,
      paidAmount: finalPaidAmount,
      dueAmount: finalDueAmount,
      paymentStatus: finalPaymentStatus,
      paymentMethod: paymentMethod || 'CASH',
      payments: initialPayments,
      notes,
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

    const populatedSale = await Sale.findById(sale._id)
      .populate('items.productId', 'name unit categoryId')
      .populate('payments.recordedBy', 'name');

    res.status(201).json({ success: true, data: populatedSale });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Invoice number already exists for this tenant' });
    }
    res.status(400).json({ success: false, error: error.message || 'Error creating sale' });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod = 'CASH', paymentDate, notes } = req.body;
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Payment amount must be greater than 0' });
    }

    const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!sale) return res.status(404).json({ success: false, error: 'Sale not found' });
    if (sale.status === 'VOIDED') return res.status(400).json({ success: false, error: 'Cannot add payment to a voided sale' });

    // Calculate current due accounting for legacy records
    const currentPaid = typeof sale.paidAmount === 'number' ? sale.paidAmount : (sale.paymentStatus === 'PAID' ? sale.total : 0);
    const currentDue = typeof sale.dueAmount === 'number' ? sale.dueAmount : Math.max(0, sale.total - currentPaid);

    if (currentDue <= 0) {
      return res.status(400).json({ success: false, error: 'This invoice is already fully paid.' });
    }

    if (payAmount > currentDue) {
      return res.status(400).json({ 
        success: false, 
        error: `Payment amount (₹${payAmount}) cannot exceed remaining balance due of ₹${currentDue}.` 
      });
    }

    sale.payments.push({
      amount: payAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      notes: notes || 'Installment Payment',
      recordedBy: req.user.userId
    });

    sale.paidAmount = currentPaid + payAmount;
    sale.dueAmount = Math.max(0, sale.total - sale.paidAmount);

    if (sale.dueAmount === 0) {
      sale.paymentStatus = 'PAID';
    } else {
      sale.paymentStatus = 'PARTIAL';
    }

    await sale.save();

    const updatedSale = await Sale.findById(sale._id)
      .populate('items.productId', 'name unit categoryId')
      .populate('payments.recordedBy', 'name');

    res.json({ success: true, data: updatedSale });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ success: false, error: error.message || 'Error recording payment' });
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
