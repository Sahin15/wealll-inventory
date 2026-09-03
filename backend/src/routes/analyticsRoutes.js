const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

router.use(protect);
router.use(requireActiveSubscription);
router.use(authorize('superadmin', 'admin', 'manager'));

router.get('/', getAnalytics);

module.exports = router;
