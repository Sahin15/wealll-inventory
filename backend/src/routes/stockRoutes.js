const express = require('express');
const { getStockMovements } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStockMovements);

module.exports = router;
