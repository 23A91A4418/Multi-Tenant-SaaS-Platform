const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  registerTenant,
  login,
  getCurrentUser,
  logout,
  loginSuperAdmin,
} = require('../controllers/auth.controller');

router.post('/register-tenant', registerTenant);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);
router.post('/super-admin/login', loginSuperAdmin);

module.exports = router;
