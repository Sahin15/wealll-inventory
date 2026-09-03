const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireActiveSubscription);

router.get('/', getDashboardData);

module.exports = router;
