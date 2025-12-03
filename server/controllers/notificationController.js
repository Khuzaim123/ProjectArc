const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/responseUtils');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        const notifications = await notificationService.getUserNotifications(
            req.user._id,
            parseInt(limit)
        );

        successResponse(res, 200, 'Notifications retrieved successfully', { notifications });
    } catch (error) {
        next(error);
    }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);

        successResponse(res, 200, 'Unread count retrieved successfully', { count });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;

        const notification = await notificationService.markAsRead(
            notificationId,
            req.user._id
        );

        successResponse(res, 200, 'Notification marked as read', { notification });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user._id);

        successResponse(res, 200, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
const deleteNotification = async (req, res, next) => {
    try {
        const { notificationId } = req.params;

        await notificationService.deleteNotification(notificationId, req.user._id);

        successResponse(res, 200, 'Notification deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
