const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// @desc    Get activities for a workspace
// @route   GET /api/activities/:workspaceId
// @access  Private
const getWorkspaceActivities = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const activities = await Activity.find({ workspace: workspaceId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Activity.countDocuments({ workspace: workspaceId });

        successResponse(res, 200, 'Activities retrieved successfully', {
            activities,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > parseInt(skip) + parseInt(limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent activities across all user's workspaces
// @route   GET /api/activities/recent
// @access  Private
const getRecentActivities = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;

        // Get user's workspaces
        const user = await require('../models/User').findById(req.user._id).select('workspaces');

        const activities = await Activity.find({
            workspace: { $in: user.workspaces },
        })
            .populate('user', 'name avatar')
            .populate('workspace', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        successResponse(res, 200, 'Recent activities retrieved successfully', {
            activities,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Log activity (internal use by middleware)
// @route   N/A (called programmatically)
// @access  Internal
const logActivity = async ({
    workspace,
    user,
    action,
    entityType,
    entityId,
    entityName,
    details,
    metadata,
}) => {
    try {
        await Activity.create({
            workspace,
            user,
            action,
            entityType,
            entityId,
            entityName,
            details,
            metadata,
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - activity logging should not break main operations
    }
};

module.exports = {
    getWorkspaceActivities,
    getRecentActivities,
    logActivity,
};
