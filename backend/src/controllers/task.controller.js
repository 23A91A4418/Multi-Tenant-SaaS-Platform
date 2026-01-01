const { pool } = require('../config/db');
const { logAudit } = require('../services/audit.service');

const { randomUUID } = require('crypto');

/**
 * API 16: Create Task
 * POST /api/projects/:projectId/tasks
 */
const createTask = async (req, res, next) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;

  // ✅ Correct validation
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Task title is required',
    });
  }

  try {
    const tenantId = req.user.tenantId;

    // Verify project exists & belongs to tenant
    const projectResult = await pool.query(
      'SELECT id, tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (projectResult.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized project access',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
      (id, project_id, tenant_id, title, description, assigned_to, priority, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, priority, due_date, status
      `,
      [
        randomUUID(),
        projectId,
        tenantId,
        title,
        description || null,
        assignedTo || null,
        priority || 'medium',
        dueDate || null,
      ]
    );

    await logAudit({
      tenantId,
      userId: req.user.userId,
      action: 'CREATE_TASK',
      entityType: 'task',
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};


/**
 * API 17: Get Tasks by Project
 * GET /api/projects/:projectId/tasks
 */
const getTasksByProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const projectResult = await pool.query(
      'SELECT tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const tenantId = projectResult.rows[0].tenant_id;

    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    const result = await pool.query(
      `
      SELECT id, title, description, status, priority, assigned_to, created_at
      FROM tasks
      WHERE project_id = $1
      ORDER BY created_at DESC
      `,
      [projectId]
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
 * API 18: Update Task Status
 * PATCH /api/tasks/:taskId/status
 */
const updateTaskStatus = async (req, res, next) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
    });
  }

  try {
    const taskResult = await pool.query(
      `
      SELECT id, tenant_id
      FROM tasks
      WHERE id = $1
      `,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const task = taskResult.rows[0];

    if (req.user.tenantId !== task.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, title, status
      `,
      [status, taskId]
    );

    await logAudit({
      tenantId: task.tenant_id,
      userId: req.user.userId,
      action: 'UPDATE_TASK_STATUS',
      entityType: 'task',
      entityId: taskId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 19: Update Task (full)
 * PUT /api/tasks/:taskId
 */
const updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, priority, assignedTo } = req.body;

  try {
    const taskResult = await pool.query(
      `
      SELECT id, tenant_id
      FROM tasks
      WHERE id = $1
      `,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const task = taskResult.rows[0];

    if (req.user.tenantId !== task.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Validate assigned user
    if (assignedTo) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, task.tenant_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must belong to same tenant',
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        assigned_to = COALESCE($4, assigned_to),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, title, status, priority
      `,
      [title, description, priority, assignedTo, taskId]
    );

    await logAudit({
      tenantId: task.tenant_id,
      userId: req.user.userId,
      action: 'UPDATE_TASK',
      entityType: 'task',
      entityId: taskId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 19b: Delete Task
 * DELETE /api/tasks/:taskId
 */
const deleteTask = async (req, res, next) => {
  const { taskId } = req.params;

  try {
    const taskResult = await pool.query(
      'SELECT id, tenant_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const task = taskResult.rows[0];

    if (req.user.tenantId !== task.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [taskId]
    );

    await logAudit({
      tenantId: task.tenant_id,
      userId: req.user.userId,
      action: 'DELETE_TASK',
      entityType: 'task',
      entityId: taskId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
