const express = require('express');
const { getSales, createSale, voidSale } = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id/void')
  .post(authorize('admin', 'manager'), voidSale);

module.exports = router;
