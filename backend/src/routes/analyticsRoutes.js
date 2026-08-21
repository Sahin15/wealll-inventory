const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/trends', analyticsController.getTrends);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/profit-margins', analyticsController.getProfitMargins);

module.exports = router;
