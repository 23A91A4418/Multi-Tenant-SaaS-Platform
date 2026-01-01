const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const {
  getAllTenants,
  getTenantById,
  updateTenant,
} = require('../controllers/tenant.controller');

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

module.exports = router;
