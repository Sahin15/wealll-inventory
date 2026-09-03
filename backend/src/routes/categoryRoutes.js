const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireActiveSubscription);

router.route('/')
  .get(getCategories)
  .post(authorize('admin', 'manager'), createCategory);

router.route('/:id')
  .put(authorize('admin', 'manager'), updateCategory)
  .delete(authorize('admin', 'manager'), deleteCategory);

module.exports = router;
