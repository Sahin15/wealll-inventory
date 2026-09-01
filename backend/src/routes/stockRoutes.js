const express = require('express');
const { getStockMovements } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireActiveSubscription);

router.route('/')
  .get(getStockMovements);

module.exports = router;
