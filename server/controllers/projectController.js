const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { DEFAULT_COLUMNS } = require('../utils/constants');

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
    try {
        const { name, description, workspace, color, icon, startDate, endDate } = req.body;

        // Get workspace default columns
        const workspaceDoc = await Workspace.findById(workspace);

        if (!workspaceDoc) {
            return errorResponse(res, 404, 'Workspace not found');
        }

        const project = await Project.create({
            name,
            description,
            workspace,
            color,
            icon,
            startDate,
            endDate,
            columns: workspaceDoc.settings.defaultColumns || DEFAULT_COLUMNS,
        });

        // Add project to workspace
        await Workspace.findByIdAndUpdate(workspace, {
            $push: { projects: project._id },
        });

        successResponse(res, 201, 'Project created successfully', { project });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all projects in workspace
// @route   GET /api/workspaces/:workspaceId/projects
// @access  Private
const getProjectsByWorkspace = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const { status } = req.query;

        const query = { workspace: workspaceId };
        if (status) {
            query.status = status;
        }

        const projects = await Project.find(query).sort({ createdAt: -1 });

        successResponse(res, 200, 'Projects retrieved successfully', { projects });
    } catch (error) {
        next(error);
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:projectId
// @access  Private
const getProjectById = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate('workspace', 'name');

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        successResponse(res, 200, 'Project retrieved successfully', { project });
    } catch (error) {
        next(error);
    }
};

// @desc    Update project
// @route   PATCH /api/projects/:projectId
// @access  Private
const updateProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const updates = req.body;

        const project = await Project.findByIdAndUpdate(projectId, updates, {
            new: true,
            runValidators: true,
        });

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        successResponse(res, 200, 'Project updated successfully', { project });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:projectId
// @access  Private
const deleteProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Remove project from workspace
        await Workspace.findByIdAndUpdate(project.workspace, {
            $pull: { projects: projectId },
        });

        successResponse(res, 200, 'Project deleted successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Update project columns
// @route   PATCH /api/projects/:projectId/columns
// @access  Private
const updateColumns = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { columns } = req.body;

        const project = await Project.findByIdAndUpdate(
            projectId,
            { columns },
            { new: true }
        );

        successResponse(res, 200, 'Columns updated successfully', { project });
    } catch (error) {
        next(error);
    }
};

// Validation
const createProjectValidation = [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('workspace').notEmpty().withMessage('Workspace ID is required'),
    validate,
];

module.exports = {
    createProject,
    getProjectsByWorkspace,
    getProjectById,
    updateProject,
    deleteProject,
    updateColumns,
    createProjectValidation,
};
