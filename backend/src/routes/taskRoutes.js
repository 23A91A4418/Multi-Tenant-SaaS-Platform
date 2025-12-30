const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { createTask,listProjectTasks,updateTaskStatus,updateTask } = require('../controllers/taskController');

router.post('/projects/:projectId/tasks', authMiddleware, createTask);
router.get('/projects/:projectId/tasks', authMiddleware, listProjectTasks);
router.patch('/tasks/:taskId/status', authMiddleware, updateTaskStatus);
router.put('/tasks/:taskId', authMiddleware, updateTask);

module.exports = router;
