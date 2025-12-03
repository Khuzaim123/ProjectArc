const { errorResponse } = require('../utils/responseUtils');
const { ROLES } = require('../utils/constants');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

// Check if user is workspace member
const isWorkspaceMember = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return errorResponse(res, 404, 'Workspace not found');
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return errorResponse(res, 403, 'Access denied - not a workspace member');
        }

        req.workspace = workspace;
        next();
    } catch (error) {
        next(error);
    }
};

// Check if user has specific role in workspace
const hasWorkspaceRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const workspace = req.workspace;

            const member = workspace.members.find(
                (m) => m.user.toString() === req.user._id.toString()
            );

            if (!member || !allowedRoles.includes(member.role)) {
                return errorResponse(
                    res,
                    403,
                    `Access denied - requires one of: ${allowedRoles.join(', ')}`
                );
            }

            req.userRole = member.role;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Check if user is workspace owner or admin
const isWorkspaceAdmin = hasWorkspaceRole(ROLES.OWNER, ROLES.ADMIN);

// Check if user is workspace owner
const isWorkspaceOwner = hasWorkspaceRole(ROLES.OWNER);

// Check if user has access to project
const hasProjectAccess = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        const workspace = await Workspace.findById(project.workspace);

        if (!workspace) {
            return errorResponse(res, 404, 'Workspace not found');
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return errorResponse(res, 403, 'Access denied - not a workspace member');
        }

        req.project = project;
        req.workspace = workspace;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    isWorkspaceMember,
    hasWorkspaceRole,
    isWorkspaceAdmin,
    isWorkspaceOwner,
    hasProjectAccess,
};
