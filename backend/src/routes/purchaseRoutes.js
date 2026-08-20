const express = require('express');
const { getPurchases, createPurchase } = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPurchases)
  .post(createPurchase);

module.exports = router;
