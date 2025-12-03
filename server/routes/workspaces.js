const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');
const {
    isWorkspaceMember,
    isWorkspaceAdmin,
    isWorkspaceOwner,
} = require('../middleware/permissions');

// All routes are protected
router.use(protect);

// Workspace CRUD
router.post(
    '/',
    workspaceController.createWorkspaceValidation,
    workspaceController.createWorkspace
);

router.get('/', workspaceController.getWorkspaces);

router.get(
    '/:workspaceId',
    isWorkspaceMember,
    workspaceController.getWorkspaceById
);

router.patch(
    '/:workspaceId',
    isWorkspaceMember,
    isWorkspaceAdmin,
    workspaceController.updateWorkspace
);

router.delete(
    '/:workspaceId',
    isWorkspaceMember,
    isWorkspaceOwner,
    workspaceController.deleteWorkspace
);

// Invitation routes
router.post(
    '/:workspaceId/invite',
    isWorkspaceMember,
    isWorkspaceAdmin,
    workspaceController.inviteValidation,
    workspaceController.inviteUser
);

router.post('/join/:token', workspaceController.joinWorkspace);

// Member management
router.delete(
    '/:workspaceId/members/:userId',
    isWorkspaceMember,
    isWorkspaceAdmin,
    workspaceController.removeMember
);

module.exports = router;
