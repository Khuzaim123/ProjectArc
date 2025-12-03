const { upload, uploadToCloudinary } = require('../services/uploadService');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { logActivity, ACTIVITY_TYPES } = require('../services/activityService');
const { deleteFromCloudinary } = require('../services/uploadService');

// @desc    Upload file attachment
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
const uploadAttachment = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        if (!req.file) {
            return errorResponse(res, 400, 'No file uploaded');
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file, 'projectarc/attachments');

        // Add attachment to task
        task.attachments.push({
            filename: req.file.originalname,
            url: result.url,
            publicId: result.publicId,
            uploadedBy: req.user._id,
        });

        await task.save();

        // Log activity
        await logActivity(taskId, req.user._id, ACTIVITY_TYPES.ATTACHMENT_ADDED, {
            field: 'attachment',
            newValue: req.file.originalname,
        });

        successResponse(res, 201, 'File uploaded successfully', {
            attachment: task.attachments[task.attachments.length - 1],
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete attachment
// @route   DELETE /api/tasks/:taskId/attachments/:attachmentId
// @access  Private
const deleteAttachment = async (req, res, next) => {
    try {
        const { taskId, attachmentId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return errorResponse(res, 404, 'Task not found');
        }

        const attachment = task.attachments.id(attachmentId);

        if (!attachment) {
            return errorResponse(res, 404, 'Attachment not found');
        }

        // Delete from Cloudinary
        if (attachment.publicId) {
            await deleteFromCloudinary(attachment.publicId);
        }

        // Remove from task
        task.attachments.pull(attachmentId);
        await task.save();

        // Log activity
        await logActivity(taskId, req.user._id, ACTIVITY_TYPES.ATTACHMENT_DELETED, {
            field: 'attachment',
            oldValue: attachment.filename,
        });

        successResponse(res, 200, 'Attachment deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadAttachment,
    deleteAttachment,
    upload, // Export multer instance for route middleware
};
