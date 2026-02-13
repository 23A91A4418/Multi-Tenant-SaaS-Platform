const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { logAudit } = require('../services/audit.service');
const { randomUUID } = require('crypto');

/**
 * API 8: Add User to Tenant
 * POST /api/tenants/:tenantId/users
 */
const addUserToTenant = async (req, res, next) => {
  const { tenantId } = req.params;
  const { email, password, fullName, role = 'user' } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  try {
    // Tenant isolation
    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Get tenant limits
    const tenantResult = await pool.query(
      'SELECT max_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const maxUsers = tenantResult.rows[0].max_users;

    const userCountResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    if (parseInt(userCountResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'User limit reached for this tenant',
      });
    }

    // Email uniqueness per tenant
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (id, tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, full_name, role
      `,
      [randomUUID(), tenantId, email, passwordHash, fullName, role]
    );

    await logAudit({
      tenantId,
      userId: req.user.userId,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 9: Get Users by Tenant
 * GET /api/tenants/:tenantId/users
 */
const getUsersByTenant = async (req, res, next) => {
  const { tenantId } = req.params; // tenantId can be undefined if route is /api/users

  try {
    // Authorization:
    // If tenantId is provided, check if user is super_admin OR belongs to that tenant.
    // If tenantId is NOT provided, only super_admin can view all users.
    if (tenantId) {
      if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized tenant access',
        });
      }
    } else {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only Super Admin can view all users',
        });
      }
    }

    const result = await pool.query(
      `
      SELECT u.id, u.email, u.full_name, u.role, u.is_active, t.name as tenant_name
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ${tenantId ? 'WHERE u.tenant_id = $1' : ''}
      ORDER BY u.created_at DESC
      `,
      tenantId ? [tenantId] : []
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 10: Update User
 * PUT /api/users/:userId
 */
const updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, role, isActive } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT id, tenant_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const targetUser = userResult.rows[0];

    // Tenant isolation
    if (
      req.user.role !== 'super_admin' &&
      req.user.tenantId !== targetUser.tenant_id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    // Block tenant admin from modifying own role or status
    if (
      req.user.role === 'tenant_admin' &&
      req.user.userId === userId
    ) {
      if (role !== undefined || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Tenant admin cannot modify own role or status',
        });
      }
    }

    // Build safe update query
    const fields = [];
    const values = [];
    let idx = 1;

    if (fullName !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(fullName);
    }

    // Only super admin can change role or status
    if (req.user.role === 'super_admin') {
      if (role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(role);
      }
      if (isActive !== undefined) {
        fields.push(`is_active = $${idx++}`);
        values.push(isActive);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    values.push(userId);

    const result = await pool.query(
      `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, email, full_name, role, is_active
      `,
      values
    );

    await logAudit({
      tenantId: targetUser.tenant_id,
      userId: req.user.userId,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: userId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 11: Delete User
 * DELETE /api/users/:userId
 */
const deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const userResult = await pool.query(
      'SELECT id, tenant_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const targetUser = userResult.rows[0];

    // Prevent deleting self
    if (req.user.userId === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // Authorization
    if (
      req.user.role !== 'super_admin' &&
      req.user.tenantId !== targetUser.tenant_id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );

    await logAudit({
      tenantId: targetUser.tenant_id,
      userId: req.user.userId,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: userId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addUserToTenant,
  getUsersByTenant,
  updateUser,
  deleteUser,
};
