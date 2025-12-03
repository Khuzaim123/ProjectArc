const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { hasProjectAccess, isWorkspaceMember } = require('../middleware/permissions');

// All routes are protected
router.use(protect);

// Create project
router.post(
    '/',
    projectController.createProjectValidation,
    projectController.createProject
);

// Get projects by workspace
router.get(
    '/workspace/:workspaceId',
    isWorkspaceMember,
    projectController.getProjectsByWorkspace
);

// Project operations
router.get('/:projectId', hasProjectAccess, projectController.getProjectById);

router.patch('/:projectId', hasProjectAccess, projectController.updateProject);

router.delete('/:projectId', hasProjectAccess, projectController.deleteProject);

router.patch(
    '/:projectId/columns',
    hasProjectAccess,
    projectController.updateColumns
);

module.exports = router;
