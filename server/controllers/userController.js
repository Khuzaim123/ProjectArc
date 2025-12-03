const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        successResponse(res, 200, 'Profile retrieved successfully', { user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name },
            { new: true, runValidators: true }
        ).select('-password');

        successResponse(res, 200, 'Profile updated successfully', { user });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload profile avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return errorResponse(res, 400, 'Please upload an image');
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'projectarc/avatars',
            width: 200,
            height: 200,
            crop: 'fill',
            format: 'jpg',
        });

        // Delete old avatar from Cloudinary if exists
        const user = await User.findById(req.user._id);
        if (user.avatar) {
            // Extract public_id from URL
            const urlParts = user.avatar.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicId = `projectarc/avatars/${filename.split('.')[0]}`;

            await cloudinary.uploader.destroy(publicId).catch((err) => {
                console.log('Error deleting old avatar:', err);
            });
        }

        // Update user avatar
        user.avatar = result.secure_url;
        await user.save();

        successResponse(res, 200, 'Avatar uploaded successfully', {
            avatar: result.secure_url,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get notification preferences
// @route   GET /api/users/preferences
// @access  Private
const getPreferences = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('notificationPreferences');

        successResponse(res, 200, 'Preferences retrieved successfully', {
            preferences: user.notificationPreferences,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update notification preferences
// @route   PATCH /api/users/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
    try {
        const { email, push, taskAssigned, taskComment, projectUpdate, weeklyDigest } = req.body;

        const updateData = {};
        if (email !== undefined) updateData['notificationPreferences.email'] = email;
        if (push !== undefined) updateData['notificationPreferences.push'] = push;
        if (taskAssigned !== undefined) updateData['notificationPreferences.taskAssigned'] = taskAssigned;
        if (taskComment !== undefined) updateData['notificationPreferences.taskComment'] = taskComment;
        if (projectUpdate !== undefined) updateData['notificationPreferences.projectUpdate'] = projectUpdate;
        if (weeklyDigest !== undefined) updateData['notificationPreferences.weeklyDigest'] = weeklyDigest;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true }
        ).select('notificationPreferences');

        successResponse(res, 200, 'Preferences updated successfully', {
            preferences: user.notificationPreferences,
        });
    } catch (error) {
        next(error);
    }
};

// Validation
const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Name must be between 1 and 50 characters'),
    validate,
];

const updatePreferencesValidation = [
    body('email').optional().isBoolean().withMessage('Email must be a boolean'),
    body('push').optional().isBoolean().withMessage('Push must be a boolean'),
    body('taskAssigned').optional().isBoolean().withMessage('Task assigned must be a boolean'),
    body('taskComment').optional().isBoolean().withMessage('Task comment must be a boolean'),
    body('projectUpdate').optional().isBoolean().withMessage('Project update must be a boolean'),
    body('weeklyDigest').optional().isBoolean().withMessage('Weekly digest must be a boolean'),
    validate,
];

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    getPreferences,
    updatePreferences,
    updateProfileValidation,
    updatePreferencesValidation,
};
