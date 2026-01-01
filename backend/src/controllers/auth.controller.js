const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { logAudit } = require('../services/audit.service');

/**
 * API 1: Tenant Registration
 * POST /api/auth/register-tenant
 */
const registerTenant = async (req, res, next) => {
  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName,
  } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check subdomain uniqueness
    const subdomainCheck = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists',
      });
    }

    // Create tenant (default FREE plan)
    const tenantResult = await client.query(
      `
      INSERT INTO tenants
      (name, subdomain, status, subscription_plan, max_users, max_projects)
      VALUES ($1, $2, 'active', 'free', 5, 3)
      RETURNING id, subdomain
      `,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // Check email uniqueness per tenant
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, adminEmail]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create tenant admin
    const userResult = await client.query(
      `
      INSERT INTO users
      (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, 'tenant_admin')
      RETURNING id, email, full_name, role
      `,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId,
        subdomain,
        adminUser: userResult.rows[0],
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * API 2: Login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password || !tenantSubdomain) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and tenant subdomain are required',
    });
  }

  try {
    const tenantResult = await pool.query(
      'SELECT id, status FROM tenants WHERE subdomain = $1',
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active',
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, email, password_hash, full_name, role, tenant_id, is_active
      FROM users
      WHERE email = $1 AND tenant_id = $2
      `,
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 3: Get Current User
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      `
      SELECT u.id, u.email, u.full_name, u.role, u.is_active,
             t.id AS tenant_id, t.name, t.subdomain,
             t.subscription_plan, t.max_users, t.max_projects
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
      `,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const u = userResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: u.is_active,
        tenant: u.tenant_id
          ? {
              id: u.tenant_id,
              name: u.name,
              subdomain: u.subdomain,
              subscriptionPlan: u.subscription_plan,
              maxUsers: u.max_users,
              maxProjects: u.max_projects,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 4: Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  await logAudit({
    tenantId: req.user.tenantId,
    userId: req.user.userId,
    action: 'LOGOUT',
    entityType: 'auth',
    entityId: null,
    ipAddress: req.ip,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
/**
 * API: Super Admin Login
 * POST /api/auth/super-admin/login
 */
const loginSuperAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, email, password_hash, full_name, role, is_active
      FROM users
      WHERE email = $1 AND role = 'super_admin'
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: null,
      role: 'super_admin',
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout,
  loginSuperAdmin,
};
