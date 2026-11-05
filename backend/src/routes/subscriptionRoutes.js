const express = require('express');
const router = express.Router();
const { getCurrentSubscription, getSubscriptionQuote } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/current', protect, getCurrentSubscription);
router.post('/quote', protect, getSubscriptionQuote);

module.exports = router;
