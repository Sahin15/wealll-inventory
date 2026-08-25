const express = require('express');
const { getUsers, createUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admin can manage users

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;
