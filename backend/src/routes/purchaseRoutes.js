const express = require('express');
const { getPurchases, createPurchase } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'manager'), getPurchases)
  .post(authorize('admin', 'manager'), createPurchase);

module.exports = router;
