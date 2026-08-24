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
    const batches = await ClassBatch.find({ tenantId: req.user.tenantId }).select('batchNumber topic students');
    
    let allStudents = [];
    batches.forEach(batch => {
      batch.students.forEach(student => {
        allStudents.push({
          ...student.toObject(),
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          batchTopic: batch.topic
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
    const { name, phone, location, address, paymentStatus } = req.body;

    const batch = await ClassBatch.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    batch.students.push({
      name,
      phone,
      location,
      address,
      paymentStatus: paymentStatus || 'Pending',
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
    if (paymentStatus !== undefined) student.paymentStatus = paymentStatus;

    await batch.save();
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Error updating student' });
  }
};
