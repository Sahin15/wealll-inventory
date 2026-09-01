const express = require('express');
const { getTenants, createTenant, updateTenantStatus, getTenantById, updateTenant, getApplications, approveApplication, rejectApplication, getGlobalSettings, updateGlobalSettings, getTenantSubscription, updateTenantSubscription, getPlans, createPlan, updatePlan } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin')); // ONLY Super Admins can access

router.route('/tenants')
  .get(getTenants)
  .post(createTenant);

router.route('/tenants/:id')
  .get(getTenantById)
  .put(updateTenant);

router.put('/tenants/:id/status', updateTenantStatus);

router.route('/tenants/:id/subscription')
  .get(getTenantSubscription)
  .put(updateTenantSubscription);

router.route('/applications')
  .get(getApplications);

router.post('/applications/:id/approve', approveApplication);
router.post('/applications/:id/reject', rejectApplication);

router.route('/settings')
  .get(getGlobalSettings)
  .put(updateGlobalSettings);

// Plans
router.route('/plans')
  .get(getPlans)
  .post(createPlan);
  
router.route('/plans/:id')
  .put(updatePlan);

module.exports = router;
