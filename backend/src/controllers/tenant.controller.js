const { pool } = require('../config/db');
const { logAudit } = require('../services/audit.service');

/**
 * API 5: Get All Tenants
 * GET /api/tenants
 * super_admin only
 */
const getAllTenants = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, subdomain, status, subscription_plan,
             max_users, max_projects, created_at
      FROM tenants
      ORDER BY created_at DESC
      `
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
 * API 6: Get Tenant By ID
 * GET /api/tenants/:tenantId
 */
const getTenantById = async (req, res, next) => {
  const { tenantId } = req.params;

  try {
    // tenant_admin and users can only access their own tenant
    if (
      req.user.role !== 'super_admin' &&
      req.user.tenantId !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, subdomain, status, subscription_plan,
             max_users, max_projects, created_at
      FROM tenants
      WHERE id = $1
      `,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 7: Update Tenant
 * PUT /api/tenants/:tenantId
 * tenant_admin can update ONLY name
 */
const updateTenant = async (req, res, next) => {
  const { tenantId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Tenant name is required',
    });
  }

  try {
    // Authorization rules
    if (req.user.role === 'tenant_admin') {
      if (req.user.tenantId !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized tenant access',
        });
      }
    } else if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    // Only update name (no other fields allowed)
    const result = await pool.query(
      `
      UPDATE tenants
      SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, subdomain, status, subscription_plan,
                max_users, max_projects
      `,
      [name, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    // Audit log
    await logAudit({
      tenantId,
      userId: req.user.userId,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: tenantId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  updateTenant,
};
