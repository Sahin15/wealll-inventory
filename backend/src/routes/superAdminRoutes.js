const express = require('express');
const { getTenants, createTenant } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin')); // ONLY Super Admins can access

router.route('/tenants')
  .get(getTenants)
  .post(createTenant);

module.exports = router;
