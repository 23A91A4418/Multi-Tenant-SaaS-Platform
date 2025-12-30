const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

/**
 * API 12: Create Project
 */
const createProject = async (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const tenantId = req.user.tenantId;
    const createdBy = req.user.userId;

    // Get tenant limits
    const tenantResult = await pool.query(
      `SELECT max_projects FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const maxProjects = tenantResult.rows[0].max_projects;

    // Count existing projects
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
      [tenantId]
    );

    const currentCount = parseInt(countResult.rows[0].count, 10);

    if (currentCount >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached',
      });
    }

    // Insert project
    const projectId = uuidv4();

    const insertResult = await pool.query(
      `INSERT INTO projects
       (id, tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, tenant_id, name, description, status, created_by, created_at`,
      [projectId, tenantId, name, description || null, status, createdBy]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: insertResult.rows[0].id,
        tenantId: insertResult.rows[0].tenant_id,
        name: insertResult.rows[0].name,
        description: insertResult.rows[0].description,
        status: insertResult.rows[0].status,
        createdBy: insertResult.rows[0].created_by,
        createdAt: insertResult.rows[0].created_at,
      },
    });
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
    });
  }
};
/**
 * API 13: List Projects
 */
const listProjects = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const {
      status,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    const filters = [];
    const values = [tenantId];
    let idx = 2;

    let whereClause = `WHERE p.tenant_id = $1`;

    if (status) {
      whereClause += ` AND p.status = $${idx}`;
      values.push(status);
      idx++;
    }

    if (search) {
      whereClause += ` AND p.name ILIKE $${idx}`;
      values.push(`%${search}%`);
      idx++;
    }

    // Total count
    const totalResult = await pool.query(
      `SELECT COUNT(*) 
       FROM projects p
       ${whereClause}`,
      values
    );

    const total = parseInt(totalResult.rows[0].count, 10);

    // Main query
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.id AS creator_id,
        u.full_name AS creator_name,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_task_count
      FROM projects p
      JOIN users u ON p.created_by = u.id
      LEFT JOIN tasks t ON t.project_id = p.id
      ${whereClause}
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limitNum, offset]
    );

    const projects = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      createdBy: {
        id: row.creator_id,
        fullName: row.creator_name,
      },
      taskCount: parseInt(row.task_count, 10),
      completedTaskCount: parseInt(row.completed_task_count, 10),
      createdAt: row.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: {
        projects,
        total,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (err) {
    console.error('LIST PROJECTS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    });
  }
};
/**
 * API 14: Update Project
 */
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body || {};


    if (!name && !description && !status) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided',
      });
    }

    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const role = req.user.role;

    // Fetch project
    const projectResult = await pool.query(
      `SELECT id, created_by, tenant_id
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // Tenant isolation
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    //  Authorization
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Build dynamic update
    const updates = [];
    const values = [];
    let idx = 1;

    if (name) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }

    values.push(projectId);

    const updateResult = await pool.query(
      `
      UPDATE projects
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, description, status, updated_at
      `,
      values
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: updateResult.rows[0].id,
        name: updateResult.rows[0].name,
        description: updateResult.rows[0].description,
        status: updateResult.rows[0].status,
        updatedAt: updateResult.rows[0].updated_at,
      },
    });
  } catch (err) {
    console.error('UPDATE PROJECT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
    });
  }
};
/**
 * API 15: Delete Project
 */
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    // Fetch project
    const projectResult = await pool.query(
      `SELECT id, tenant_id, created_by
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    //Tenant isolation
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Authorization
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    //  Delete tasks first (safe for FK constraints)
    await pool.query(
      `DELETE FROM tasks WHERE project_id = $1`,
      [projectId]
    );

    // Delete project
    await pool.query(
      `DELETE FROM projects WHERE id = $1`,
      [projectId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    console.error('DELETE PROJECT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};




module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
};
