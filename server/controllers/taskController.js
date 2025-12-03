const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { logActivity, ACTIVITY_TYPES } = require('../services/activityService');
const { notifyTaskAssigned } = require('../services/notificationService');
const { deleteFromCloudinary } = require('../services/uploadService');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
    try {
        const {
            title,
            description,
            project,
            column,
            assignee,
            priority,
            dueDate,
            startDate,
            endDate,
            labels,
        } = req.body;

        // Get the max position in the column
        const tasksInColumn = await Task.find({ project, column });
        const maxPosition = tasksInColumn.length > 0
            ? Math.max(...tasksInColumn.map(t => t.position))
            : -1;

        const task = await Task.create({
            title,
            description,
            project,
            column,
            position: maxPosition + 1,
            assignee,
            reporter: req.user._id,
            priority,
            dueDate,
            startDate,
            endDate,
            labels,
        });

        // Log activity
        await logActivity(task._id, req.user._id, ACTIVITY_TYPES.CREATED);

        // Notify assignee if assigned
        if (assignee && assignee !== req.user._id.toString()) {
            await notifyTaskAssigned(task, assignee, req.user._id);
        }

        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'name avatar email')
            .populate('reporter', 'name avatar email');

        successResponse(res, 201, 'Task created successfully', { task: populatedTask });
    } catch (error) {
        next(error);
    }
};

// @desc    Get tasks by project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasksByProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { assignee, priority, status, column } = req.query;

        const query = { project: projectId };

        if (assignee) query.assignee = assignee;
        if (priority) query.priority = priority;
        if (status) query.status = status;
        if (column) query.column = column;

        const tasks = await Task.find(query)
            .populate('assignee', 'name avatar email')
            .populate('reporter', 'name avatar email')
            .sort({ position: 1 });

        successResponse(res, 200, 'Tasks retrieved successfully', { tasks });
    } catch (error) {
        next(error);
    }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:taskId
// @access  Private
const getTaskById = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId)
            .populate('assignee', 'name avatar email')
            .populate('reporter', 'name avatar email')
            .populate('project', 'name color')
            .populate('attachments.uploadedBy', 'name')
            .populate('activityLog.user', 'name avatar');

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        successResponse(res, 200, 'Task retrieved successfully', { task });
    } catch (error) {
        next(error);
    }
};

// @desc    Update task
// @route   PATCH /api/tasks/:taskId
// @access  Private
const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        // Track what changed for activity log
        const changes = [];

        Object.keys(updates).forEach(key => {
            if (task[key] !== updates[key]) {
                changes.push({
                    field: key,
                    oldValue: String(task[key]),
                    newValue: String(updates[key]),
                });
            }
        });

        // Update task
        Object.assign(task, updates);
        await task.save();

        // Log activity for each change
        for (const change of changes) {
            await logActivity(taskId, req.user._id, ACTIVITY_TYPES.UPDATED, change);
        }

        // If assignee changed, send notification
        if (updates.assignee && updates.assignee !== String(task.assignee)) {
            await notifyTaskAssigned(task, updates.assignee, req.user._id);
        }

        const updatedTask = await Task.findById(taskId)
            .populate('assignee', 'name avatar email')
            .populate('reporter', 'name avatar email');

        successResponse(res, 200, 'Task updated successfully', { task: updatedTask });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId
// @access  Private
const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        // Delete attachments from Cloudinary
        for (const attachment of task.attachments) {
            if (attachment.publicId) {
                await deleteFromCloudinary(attachment.publicId);
            }
        }

        await Task.findByIdAndDelete(taskId);

        successResponse(res, 200, 'Task deleted successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Move task (drag and drop in Kanban)
// @route   PATCH /api/tasks/:taskId/move
// @access  Private
const moveTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { column, position } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        const oldColumn = task.column;
        const oldPosition = task.position;

        // If moving to different column
        if (column !== oldColumn) {
            // Update positions in old column
            await Task.updateMany(
                { project: task.project, column: oldColumn, position: { $gt: oldPosition } },
                { $inc: { position: -1 } }
            );

            // Update positions in new column
            await Task.updateMany(
                { project: task.project, column, position: { $gte: position } },
                { $inc: { position: 1 } }
            );

            task.column = column;
            task.position = position;
        } else {
            // Moving within same column
            if (position > oldPosition) {
                await Task.updateMany(
                    {
                        project: task.project,
                        column,
                        position: { $gt: oldPosition, $lte: position },
                    },
                    { $inc: { position: -1 } }
                );
            } else {
                await Task.updateMany(
                    {
                        project: task.project,
                        column,
                        position: { $gte: position, $lt: oldPosition },
                    },
                    { $inc: { position: 1 } }
                );
            }

            task.position = position;
        }

        await task.save();

        // Log activity
        await logActivity(taskId, req.user._id, ACTIVITY_TYPES.UPDATED, {
            field: 'column',
            oldValue: oldColumn,
            newValue: column,
        });

        successResponse(res, 200, 'Task moved successfully', { task });
    } catch (error) {
        next(error);
    }
};

// @desc    Add subtask
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
const addSubtask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        task.subtasks.push({ title });
        await task.save();

        successResponse(res, 201, 'Subtask added successfully', { task });
    } catch (error) {
        next(error);
    }
};

// @desc    Update subtask
// @route   PATCH /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
const updateSubtask = async (req, res, next) => {
    try {
        const { taskId, subtaskId } = req.params;
        const { title, completed } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        const subtask = task.subtasks.id(subtaskId);

        if (!subtask) {
            return errorResponse(res, 404, 'Subtask not found');
        }

        if (title !== undefined) subtask.title = title;
        if (completed !== undefined) subtask.completed = completed;

        await task.save();

        successResponse(res, 200, 'Subtask updated successfully', { task });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete subtask
// @route   DELETE /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
const deleteSubtask = async (req, res, next) => {
    try {
        const { taskId, subtaskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        task.subtasks.pull(subtaskId);
        await task.save();

        successResponse(res, 200, 'Subtask deleted successfully', { task });
    } catch (error) {
        next(error);
    }
};

// Validation
const createTaskValidation = [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project ID is required'),
    body('column').notEmpty().withMessage('Column is required'),
    validate,
];

const moveTaskValidation = [
    body('column').notEmpty().withMessage('Column is required'),
    body('position').isInt({ min: 0 }).withMessage('Position must be a positive integer'),
    validate,
];

const subtaskValidation = [
    body('title').trim().notEmpty().withMessage('Subtask title is required'),
    validate,
];

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    createTaskValidation,
    moveTaskValidation,
    subtaskValidation,
};
