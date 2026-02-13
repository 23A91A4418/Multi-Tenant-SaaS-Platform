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
 * API 9: Get all users (Super Admin only)
 * GET /api/users
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['super_admin']),
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
