const crypto = require('crypto');
const pool = require('../config/db');

/**
 * API 16: Create Task
 */
const createTask = async (req, res) => {
  const projectId = String(req.params.projectId);

  const {
    title,
    description,
    assignedTo,
    priority = 'medium',
    dueDate,
  } = req.body || {};

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required',
    });
  }

  try {
    // Verify project belongs to tenant
    const projectResult = await pool.query(
      `SELECT id, tenant_id FROM projects WHERE id = $1 AND tenant_id = $2`,
      [projectId, req.user.tenantId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Project does not exist or access denied',
      });
    }

    const project = projectResult.rows[0];

    // Validate assigned user
    if (assignedTo) {
      const userCheck = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, project.tenant_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to this tenant',
        });
      }
    }

    const taskId = crypto.randomUUID();

    const result = await pool.query(
      `INSERT INTO tasks
       (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, 'todo', $6, $7, $8)
       RETURNING *`,
      [
        taskId,
        projectId,
        project.tenant_id,
        title,
        description || null,
        priority,
        assignedTo || null,
        dueDate || null,
      ]
    );

    const task = result.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: task.id,
        projectId: task.project_id,
        tenantId: task.tenant_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to,
        dueDate: task.due_date,
        createdAt: task.created_at,
      },
    });
  } catch (err) {
    console.error('CREATE TASK ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
    });
  }
};

/**
 * API 17: List Project Tasks
 */
const listProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.min(parseInt(limit), 100);
  const offset = (pageNum - 1) * limitNum;

  try {
    const projectCheck = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND tenant_id = $2`,
      [projectId, req.user.tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Project does not belong to your tenant',
      });
    }

    let conditions = ['t.project_id = $1'];
    let values = [projectId];
    let idx = 2;

    if (status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(status);
    }

    if (priority) {
      conditions.push(`t.priority = $${idx++}`);
      values.push(priority);
    }

    if (assignedTo) {
      conditions.push(`t.assigned_to = $${idx++}`);
      values.push(assignedTo);
    }

    if (search) {
      conditions.push(`LOWER(t.title) LIKE $${idx++}`);
      values.push(`%${search.toLowerCase()}%`);
    }

    const whereClause = conditions.join(' AND ');

    const tasksResult = await pool.query(
      `
      SELECT t.*, u.full_name, u.email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
      `,
      [...values, limitNum, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tasks t WHERE ${whereClause}`,
      values
    );

    return res.status(200).json({
      success: true,
      data: {
        tasks: tasksResult.rows,
        total: Number(countResult.rows[0].count),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(countResult.rows[0].count / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (err) {
    console.error('LIST TASKS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
    });
  }
};

/**
 * API 18: Update Task Status
 */
const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  const allowed = ['todo', 'in_progress', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task status',
    });
  }

  try {
    const taskCheck = await pool.query(
      `SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2`,
      [taskId, req.user.tenantId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Task does not belong to your tenant',
      });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, taskId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('UPDATE TASK STATUS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task status',
    });
  }
};

/**
 * API 19: Update Task
 */
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, assignedTo, dueDate } = req.body || {};

  const allowedStatus = ['todo', 'in_progress', 'completed'];
  const allowedPriority = ['low', 'medium', 'high'];

  try {
    const taskCheck = await pool.query(
      `SELECT id, tenant_id FROM tasks WHERE id = $1`,
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (taskCheck.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (status !== undefined) {
      if (!allowedStatus.includes(status)) return res.status(400).json({ success:false,message:'Invalid status'});
      updates.push(`status = $${idx++}`); values.push(status);
    }
    if (priority !== undefined) {
      if (!allowedPriority.includes(priority)) return res.status(400).json({ success:false,message:'Invalid priority'});
      updates.push(`priority = $${idx++}`); values.push(priority);
    }
    if (assignedTo !== undefined) { updates.push(`assigned_to = $${idx++}`); values.push(assignedTo); }
    if (dueDate !== undefined) { updates.push(`due_date = $${idx++}`); values.push(dueDate); }

    if (updates.length === 0) {
      return res.status(400).json({ success:false,message:'No fields to update'});
    }

    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      [...values, taskId]
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('UPDATE TASK ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
    });
  }
};

module.exports = {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
};
