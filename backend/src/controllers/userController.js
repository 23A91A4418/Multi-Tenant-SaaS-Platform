const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');

/**
 * API 8: Add User to Tenant
 */
const addUserToTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { email, password, fullName, role = 'user' } = req.body;

  try {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const tenantResult = await pool.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const maxUsers = tenantResult.rows[0].max_users;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );

    if (parseInt(countResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached',
      });
    }

    const emailCheck = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND tenant_id = $2`,
      [email, tenantId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const result = await pool.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [userId, tenantId, email, hashedPassword, fullName, role]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        tenantId: result.rows[0].tenant_id,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (err) {
    console.error('API 8 ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/**
 * API 9: List Tenant Users
 */
const listTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (req.user.tenantId !== tenantId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const { search = '', role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const usersResult = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows,
      },
    });
  } catch (err) {
    console.error('LIST USERS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * API 10: Update User
 */
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, role, isActive } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT id, tenant_id FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetUser = userResult.rows[0];

    if (
      req.user.role !== 'super_admin' &&
      targetUser.tenant_id !== req.user.tenantId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'user') {
      if (req.user.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile',
        });
      }
      if (role !== undefined || isActive !== undefined) {
        return res.status(400).json({
          success: false,
          message: 'Only fullName can be updated',
        });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           role = COALESCE($2, role),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, role, is_active, updated_at`,
      [fullName, role, isActive, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('UPDATE USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

/**
 * API 11: Delete User (Soft Delete)
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.userId === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete yourself',
      });
    }

    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
      [userId, req.user.tenantId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error('DELETE USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

module.exports = {
  addUserToTenant,
  listTenantUsers,
  updateUser,
  deleteUser,
};
