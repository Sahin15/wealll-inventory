const express = require('express');
const { getTenants, createTenant, getApplications, approveApplication, rejectApplication } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin')); // ONLY Super Admins can access

router.route('/tenants')
  .get(getTenants)
  .post(createTenant);

router.route('/applications')
  .get(getApplications);

router.post('/applications/:id/approve', approveApplication);
router.post('/applications/:id/reject', rejectApplication);

module.exports = router;
