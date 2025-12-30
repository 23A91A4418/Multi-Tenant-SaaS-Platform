const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { createProject,
    listProjects,
    updateProject,
    deleteProject,
 } = require('../controllers/projectController');

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, listProjects);
router.put('/:projectId', authMiddleware, updateProject);
router.delete('/:projectId', authMiddleware, deleteProject);

module.exports = router;
