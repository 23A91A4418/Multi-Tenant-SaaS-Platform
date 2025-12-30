const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  addUserToTenant,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// API 8
router.post(
  '/tenants/:tenantId/users',
  authMiddleware,
  addUserToTenant
);

// API 10
router.put(
  '/users/:userId',
  authMiddleware,
  updateUser
);

// API 11
router.delete(
  '/users/:userId',
  authMiddleware,
  deleteUser
);

module.exports = router;
