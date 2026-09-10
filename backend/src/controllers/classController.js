const mongoose = require('mongoose');
const ClassBatch = require('../models/ClassBatch');

// @desc    Get all class batches
// @route   GET /api/classes
// @access  Private
exports.getBatches = async (req, res) => {
  try {
    const batches = await ClassBatch.find({ tenantId: req.user.tenantId }).sort({ date: -1 });
    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all students across all batches
// @route   GET /api/classes/students/all
// @access  Private
exports.getAllStudents = async (req, res) => {
  try {
    const batches = await ClassBatch.find({ tenantId: req.user.tenantId }).select('batchNumber topic seatPrice location date students');
    
    let allStudents = [];
    batches.forEach(batch => {
      batch.students.forEach(student => {
        allStudents.push({
          ...student.toObject(),
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          batchTopic: batch.topic,
          seatPrice: batch.seatPrice,
          batchDate: batch.date,
          batchLocation: batch.location
        });
      });
    });

    // Sort by most recently enrolled
    allStudents.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

    res.json({ success: true, data: allStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single batch
// @route   GET /api/classes/:id
// @access  Private
exports.getBatch = async (req, res) => {
  try {
    const batch = await ClassBatch.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a batch
// @route   POST /api/classes
// @access  Private
exports.createBatch = async (req, res) => {
  try {
    const { batchNumber, topic, date, location, seatPrice } = req.body;

    const batch = new ClassBatch({
      tenantId: req.user.tenantId,
      batchNumber,
      topic,
      date,
      location,
      seatPrice: Number(seatPrice),
      createdBy: req.user.userId
    });

    await batch.save();
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Batch number already exists' });
    }
    res.status(400).json({ success: false, error: error.message || 'Error creating batch' });
  }
};

// @desc    Update a batch
// @route   PUT /api/classes/:id
// @access  Private
exports.updateBatch = async (req, res) => {
  try {
    const { topic, date, location, seatPrice } = req.body;

    const batch = await ClassBatch.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { topic, date, location, seatPrice: Number(seatPrice) },
      { new: true, runValidators: true }
    );

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Error updating batch' });
  }
};

// @desc    Add a student to a batch
// @route   POST /api/classes/:id/students
// @access  Private
exports.addStudent = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      location, 
      address, 
      paymentStatus = 'Pending', 
      paidAmount = 0, 
      paymentMethod = 'CASH', 
      notes 
    } = req.body;

    const batch = await ClassBatch.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const seatFee = batch.seatPrice || 0;
    let finalPaid = 0;
    let finalStatus = paymentStatus;

    if (paymentStatus === 'Paid') {
      finalPaid = seatFee;
    } else if (paymentStatus === 'Pending') {
      finalPaid = 0;
    } else if (paymentStatus === 'Partial') {
      const parsed = Number(paidAmount) || 0;
      finalPaid = Math.max(0, Math.min(seatFee, parsed));
      if (finalPaid >= seatFee && seatFee > 0) {
        finalStatus = 'Paid';
      } else if (finalPaid <= 0) {
        finalStatus = 'Pending';
      }
    }

    const finalDue = Math.max(0, seatFee - finalPaid);
    const initialPayments = [];
    if (finalPaid > 0) {
      initialPayments.push({
        amount: finalPaid,
        paymentDate: new Date(),
        paymentMethod: paymentMethod || 'CASH',
        notes: notes || 'Advance / Initial Tuition Fee',
        recordedBy: req.user.userId
      });
    }

    batch.students.push({
      name,
      phone,
      location,
      address,
      paymentStatus: finalStatus,
      paidAmount: finalPaid,
      dueAmount: finalDue,
      payments: initialPayments,
      attended: false
    });

    await batch.save();
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Error adding student' });
  }
};

// @desc    Update student in batch (attendance, payment)
// @route   PUT /api/classes/:id/students/:studentId
// @access  Private
exports.updateStudent = async (req, res) => {
  try {
    const { attended, paymentStatus } = req.body;

    const batch = await ClassBatch.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const student = batch.students.id(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    if (attended !== undefined) student.attended = attended;
    if (paymentStatus !== undefined) {
      student.paymentStatus = paymentStatus;
      const seatFee = batch.seatPrice || 0;
      if (paymentStatus === 'Paid') {
        const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : 0;
        const diff = Math.max(0, seatFee - currentPaid);
        if (diff > 0) {
          student.payments.push({
            amount: diff,
            paymentDate: new Date(),
            paymentMethod: 'CASH',
            notes: 'Settled to Paid',
            recordedBy: req.user.userId
          });
        }
        student.paidAmount = seatFee;
        student.dueAmount = 0;
      } else if (paymentStatus === 'Pending') {
        student.dueAmount = seatFee;
        student.paidAmount = 0;
      }
    }

    await batch.save();
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Error updating student' });
  }
};

// @desc    Add installment payment for a student
// @route   POST /api/classes/:id/students/:studentId/payments
// @access  Private
exports.addStudentPayment = async (req, res) => {
  try {
    const { amount, paymentMethod = 'CASH', paymentDate, notes } = req.body;
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Payment amount must be greater than 0' });
    }

    const batch = await ClassBatch.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const student = batch.students.id(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const seatFee = batch.seatPrice || 0;
    const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : (student.paymentStatus === 'Paid' ? seatFee : 0);
    const currentDue = typeof student.dueAmount === 'number' ? student.dueAmount : Math.max(0, seatFee - currentPaid);

    if (currentDue <= 0) {
      return res.status(400).json({ success: false, error: 'Tuition for this student is already fully paid.' });
    }

    if (payAmount > currentDue) {
      return res.status(400).json({ 
        success: false, 
        error: `Payment amount (₹${payAmount}) cannot exceed remaining balance due of ₹${currentDue}.` 
      });
    }

    student.payments.push({
      amount: payAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      notes: notes || 'Installment Payment',
      recordedBy: req.user.userId
    });

    student.paidAmount = currentPaid + payAmount;
    student.dueAmount = Math.max(0, seatFee - student.paidAmount);

    if (student.dueAmount === 0) {
      student.paymentStatus = 'Paid';
    } else {
      student.paymentStatus = 'Partial';
    }

    await batch.save();
    res.json({ success: true, data: batch });
  } catch (error) {
    console.error('Error adding student payment:', error);
    res.status(500).json({ success: false, error: error.message || 'Error recording student payment' });
  }
};
