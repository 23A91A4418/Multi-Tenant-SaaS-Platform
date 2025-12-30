const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * =========================
 * API 1: Register Tenant
 * =========================
 * POST /api/auth/register-tenant
 */
const registerTenant = async (req, res) => {
  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName,
  } = req.body;

  // Validation
  if (
    !tenantName ||
    !subdomain ||
    !adminEmail ||
    !adminPassword ||
    !adminFullName
  ) {
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
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists',
      });
    }

    //Check admin email uniqueness
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Admin email already exists',
      });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const tenantId = crypto.randomUUID()
    const adminId = crypto.randomUUID()


    //Create tenant (FREE plan defaults)
    await client.query(
      `INSERT INTO tenants
       (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, 'active', 'free', 5, 3)`,
      [tenantId, tenantName, subdomain]
    );

    //Create tenant admin
    await client.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'tenant_admin', true)`,
      [adminId, tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query('COMMIT');

    //Success response (MATCHES TASK)
    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId,
        subdomain,
        adminUser: {
          id: adminId,
          email: adminEmail,
          fullName: adminFullName,
          role: 'tenant_admin',
        },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('REGISTER TENANT ERROR:', err);

    return res.status(500).json({
      success: false,
      message: 'Tenant registration failed',
    });
  } finally {
    client.release();
  }
};

/**
 * =========================
 * API 2: Login
 * =========================
 * POST /api/auth/login
 */
const login = async (req, res) => {
  console.log('NEW LOGIN FUNCTION HIT');

  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    let userResult;
    let tenantId = null;

    // ===============================
    // SUPER ADMIN LOGIN (NO TENANT)
    // ===============================
    if (email === 'superadmin@system.com') {
      userResult = await pool.query(
        `SELECT id, email, password_hash, full_name, role, tenant_id
         FROM users
         WHERE email = $1 AND role = 'super_admin'`,
        [email]
      );
    } 
    // =====================================
    // TENANT USER / TENANT ADMIN LOGIN
    // =====================================
    else {
      if (!tenantSubdomain) {
        return res.status(400).json({
          success: false,
          message: 'tenantSubdomain is required',
        });
      }

      const tenantResult = await pool.query(
        `SELECT id, status
         FROM tenants
         WHERE subdomain = $1`,
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

      tenantId = tenant.id;

      userResult = await pool.query(
        `SELECT id, email, password_hash, full_name, role, tenant_id
         FROM users
         WHERE email = $1 AND tenant_id = $2`,
        [email, tenantId]
      );
    }

    // ===============================
    // USER NOT FOUND
    // ===============================
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = userResult.rows[0];

    // ===============================
    // PASSWORD CHECK
    // ===============================
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ===============================
    // JWT TOKEN
    // ===============================
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

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
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};


/**
 * =========================
 * API 3: Get Current User
 * =========================
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active,
              t.id AS tenant_id, t.name, t.subdomain,
              t.subscription_plan, t.max_users, t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenant: user.tenant_id
          ? {
              id: user.tenant_id,
              name: user.name,
              subdomain: user.subdomain,
              subscriptionPlan: user.subscription_plan,
              maxUsers: user.max_users,
              maxProjects: user.max_projects,
            }
          : null,
      },
    });
  } catch (err) {
    console.error('GET CURRENT USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

/**
 * =========================
 * API 4: Logout
 * =========================
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // JWT-based logout: client removes token
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('LOGOUT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};


module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout,
};
