const express = require('express');
const { getProducts, createProduct, updateProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), createProduct);

router.route('/:id')
  .put(authorize('admin', 'manager'), updateProduct);

module.exports = router;
