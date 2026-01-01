const { pool } = require('../config/db');
const { logAudit } = require('../services/audit.service');
const { randomUUID } = require('crypto');


/**
 * API 12: Create Project
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required',
    });
  }

  try {
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Super admin cannot create projects',
      });
    }

    // Get project limit
    const tenantResult = await pool.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    const maxProjects = tenantResult.rows[0].max_projects;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    if (parseInt(countResult.rows[0].count) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached for this tenant',
      });
    }

    const result = await pool.query(
  `
  INSERT INTO projects
  (id, tenant_id, name, description, created_by)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, name, description, status
  `,
  [
    randomUUID(),
    tenantId,
    name,
    description || null,
    req.user.userId,
  ]
);


    await logAudit({
      tenantId,
      userId: req.user.userId,
      action: 'CREATE_PROJECT',
      entityType: 'project',
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 13: Get Projects
 * GET /api/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, description, status, created_at
      FROM projects
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId]
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
 * API 14: Update Project
 * PUT /api/projects/:projectId
 */
const updateProject = async (req, res, next) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;

  try {
    const projectResult = await pool.query(
      `
      SELECT id, tenant_id, created_by
      FROM projects
      WHERE id = $1
      `,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // Authorization
    if (
      req.user.role !== 'tenant_admin' &&
      req.user.userId !== project.created_by
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    const result = await pool.query(
      `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, description, status
      `,
      [name, description, status, projectId]
    );

    await logAudit({
      tenantId: project.tenant_id,
      userId: req.user.userId,
      action: 'UPDATE_PROJECT',
      entityType: 'project',
      entityId: projectId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 15: Delete Project
 * DELETE /api/projects/:projectId
 */
const deleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const projectResult = await pool.query(
      `
      SELECT id, tenant_id, created_by
      FROM projects
      WHERE id = $1
      `,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // Authorization
    if (
      req.user.role !== 'tenant_admin' &&
      req.user.userId !== project.created_by
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [projectId]
    );

    await logAudit({
      tenantId: project.tenant_id,
      userId: req.user.userId,
      action: 'DELETE_PROJECT',
      entityType: 'project',
      entityId: projectId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};
