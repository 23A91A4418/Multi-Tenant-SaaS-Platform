const pool = require('../config/db');

/**
 * =========================
 * API 5: Get Tenant Details
 * =========================
 * GET /api/tenants/:tenantId
 */
const getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  try {
    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status,
              subscription_plan, max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    if (role !== 'super_admin' && userTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const tenant = tenantResult.rows[0];

    const [usersCount, projectsCount, tasksCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*) FROM tasks WHERE tenant_id = $1', [tenantId]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count),
        },
      },
    });
  } catch (err) {
    console.error('GET TENANT DETAILS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant details',
    });
  }
};

/**
 * =========================
 * API 6: Update Tenant
 * =========================
 * PUT /api/tenants/:tenantId
 */
const updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { role, tenantId: userTenantId } = req.user;

  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  try {
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    if (role === 'tenant_admin') {
      if (userTenantId !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
        });
      }

      if (
        status !== undefined ||
        subscriptionPlan !== undefined ||
        maxUsers !== undefined ||
        maxProjects !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update these fields',
        });
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }

    if (role === 'super_admin') {
      if (status !== undefined) {
        fields.push(`status = $${index++}`);
        values.push(status);
      }
      if (subscriptionPlan !== undefined) {
        fields.push(`subscription_plan = $${index++}`);
        values.push(subscriptionPlan);
      }
      if (maxUsers !== undefined) {
        fields.push(`max_users = $${index++}`);
        values.push(maxUsers);
      }
      if (maxProjects !== undefined) {
        fields.push(`max_projects = $${index++}`);
        values.push(maxProjects);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const updateResult = await pool.query(
      `UPDATE tenants
       SET ${fields.join(', ')}
       WHERE id = $${index}
       RETURNING id, name`,
      [...values, tenantId]
    );

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: updateResult.rows[0],
    });
  } catch (err) {
    console.error('UPDATE TENANT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
    });
  }
};

/**
 * =========================
 * API 7: List All Tenants
 * =========================
 * GET /api/tenants
 */
const listAllTenants = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const tenants = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        t.created_at,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenants.rows,
      },
    });
  } catch (err) {
    console.error('LIST TENANTS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants',
    });
  }
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listAllTenants,
};
