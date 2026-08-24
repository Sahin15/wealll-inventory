const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const classController = require('../controllers/classController');

// All class routes are private
router.use(protect);

router.route('/')
  .get(classController.getBatches)
  .post(classController.createBatch);

router.route('/:id')
  .get(classController.getBatch)
  .put(classController.updateBatch);

router.route('/:id/students')
  .post(classController.addStudent);

router.route('/:id/students/:studentId')
  .put(classController.updateStudent);

module.exports = router;
