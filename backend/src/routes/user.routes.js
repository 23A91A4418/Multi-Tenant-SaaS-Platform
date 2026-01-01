const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const {
  addUserToTenant,
  getUsersByTenant,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

/**
 * API 8: Add user to tenant
 * POST /api/tenants/:tenantId/users
 */
router.post(
  '/:tenantId/users',
  authMiddleware,
  roleMiddleware(['tenant_admin']),
  addUserToTenant
);

/**
 * API 9: Get users by tenant
 * GET /api/tenants/:tenantId/users
 */
router.get(
  '/:tenantId/users',
  authMiddleware,
  getUsersByTenant
);

/**
 * API 10: Update user
 * PUT /api/users/:userId
 */
router.put(
  '/:userId',
  authMiddleware,
  updateUser
);

/**
 * API 11: Delete user
 * DELETE /api/users/:userId
 */
router.delete(
  '/:userId',
  authMiddleware,
  deleteUser
);

module.exports = router;
