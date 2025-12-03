const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { notifyCommentMention } = require('../services/notificationService');

// @desc    Create comment
// @route   POST /api/tasks/:taskId/comments
// @access  Private
const createComment = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { content } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        // Extract mentions from content (@userId format)
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
        }

        const comment = await Comment.create({
            task: taskId,
            author: req.user._id,
            content,
            mentions,
        });

        // Send notifications to mentioned users
        for (const mentionedUserId of mentions) {
            if (mentionedUserId !== req.user._id.toString()) {
                await notifyCommentMention(task, comment, mentionedUserId, req.user._id);
            }
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name avatar email');

        successResponse(res, 201, 'Comment created successfully', { comment: populatedComment });
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getCommentsByTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate('author', 'name avatar email')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Comments retrieved successfully', { comments });
    } catch (error) {
        next(error);
    }
};

// @desc    Update comment
// @route   PATCH /api/comments/:commentId
// @access  Private
const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return errorResponse(res, 404, 'Comment not found');
        }

        // Check if user is the author
        if (comment.author.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to update this comment');
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        successResponse(res, 200, 'Comment updated successfully', { comment });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return errorResponse(res, 404, 'Comment not found');
        }

        // Check if user is the author
        if (comment.author.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to delete this comment');
        }

        await Comment.findByIdAndDelete(commentId);

        successResponse(res, 200, 'Comment deleted successfully');
    } catch (error) {
        next(error);
    }
};

// Validation
const commentValidation = [
    body('content').trim().notEmpty().withMessage('Comment content is required'),
    validate,
];

module.exports = {
    createComment,
    getCommentsByTask,
    updateComment,
    deleteComment,
    commentValidation,
};
