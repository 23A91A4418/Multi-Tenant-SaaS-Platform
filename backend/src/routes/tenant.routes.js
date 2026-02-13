const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const {
  getAllTenants,
  getTenantById,
  updateTenant,
} = require('../controllers/tenant.controller');

const {
  addUserToTenant,
  getUsersByTenant,
} = require('../controllers/user.controller');

// API 5: List all tenants (super_admin only)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['super_admin']),
  getAllTenants
);

// API 6: Get tenant by ID
router.get(
  '/:tenantId',
  authMiddleware,
  getTenantById
);

// API 7: Update tenant (name only)
router.put(
  '/:tenantId',
  authMiddleware,
  updateTenant
);

// API 8: Add user to tenant
router.post(
  '/:tenantId/users',
  authMiddleware,
  roleMiddleware(['tenant_admin']),
  addUserToTenant
);

// API 9: Get users by tenant
router.get(
  '/:tenantId/users',
  authMiddleware,
  getUsersByTenant
);

module.exports = router;
