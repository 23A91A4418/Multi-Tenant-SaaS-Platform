const express = require('express');
const router = express.Router();



const authMiddleware = require('../middleware/auth.middleware');

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');

const {
  createTask,
  getTasksByProject,
} = require('../controllers/task.controller');

// API 12: Create project
router.post('/', authMiddleware, createProject);

// API 13: Get projects
router.get('/', authMiddleware, getProjects);

// API 14: Update project
router.put('/:projectId', authMiddleware, updateProject);

// API 15: Delete project
router.delete('/:projectId', authMiddleware, deleteProject);

// TASK SUB-ROUTES
router.post('/:projectId/tasks', authMiddleware, createTask);
router.get('/:projectId/tasks', authMiddleware, getTasksByProject);

module.exports = router;
