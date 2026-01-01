const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

/**
 * API 16: Create task
 * POST /api/projects/:projectId/tasks
 */
router.post(
  '/:projectId/tasks',
  authMiddleware,
  roleMiddleware(['tenant_admin', 'user']),
  createTask
);

/**
 * API 17: Get tasks by project
 * GET /api/projects/:projectId/tasks
 */
router.get(
  '/:projectId/tasks',
  authMiddleware,
  getTasksByProject
);

/**
 * API 18: Update task
 * PUT /api/tasks/:taskId
 */
router.put(
  '/:taskId',
  authMiddleware,
  updateTask
);
/**
 * API 18: Update Task Status
 * PATCH /api/tasks/:taskId/status
 */
router.patch(
  '/:taskId/status',
  authMiddleware,
  roleMiddleware(['tenant_admin', 'user']),
  updateTaskStatus
);

/**
 * API 19: Delete task
 * DELETE /api/tasks/:taskId
 */
router.delete(
  '/:taskId',
  authMiddleware,
  deleteTask
);

module.exports = router;
