const Notification = require('../models/Notification');
const { sendEmail, taskAssignedEmail, commentMentionEmail, taskDueSoonEmail } = require('./emailService');
const User = require('../models/User');
const { NOTIFICATION_TYPES } = require('../utils/constants');

// Create notification
const createNotification = async (notificationData) => {
    const notification = await Notification.create(notificationData);
    return notification;
};

// Get user notifications
const getUserNotifications = async (userId, limit = 50) => {
    const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'name avatar')
        .populate('task', 'title')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

    return notifications;
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true, readAt: new Date() },
        { new: true }
    );

    return notification;
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date() }
    );
};

// Get unread count
const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({
        recipient: userId,
        read: false,
    });

    return count;
};

// Send task assigned notification
const notifyTaskAssigned = async (task, assigneeId, assignerId) => {
    const assignee = await User.findById(assigneeId);
    const assigner = await User.findById(assignerId);

    if (!assignee || !assigner) return;

    // Create in-app notification
    if (assignee.notificationPreferences.inApp) {
        await createNotification({
            recipient: assigneeId,
            sender: assignerId,
            type: NOTIFICATION_TYPES.TASK_ASSIGNED,
            message: `${assigner.name} assigned you a task: ${task.title}`,
            task: task._id,
            project: task.project,
        });
    }

    // Send email notification
    if (assignee.notificationPreferences.email) {
        const taskUrl = `${process.env.CLIENT_URL}/tasks/${task._id}`;
        const html = taskAssignedEmail(assignee.name, task.title, 'Project Name', taskUrl);

        await sendEmail({
            to: assignee.email,
            subject: 'New Task Assigned',
            html,
        }).catch(err => console.error('Email send error:', err));
    }
};

// Send comment mention notification
const notifyCommentMention = async (task, comment, mentionedUserId, commenterId) => {
    const mentioned = await User.findById(mentionedUserId);
    const commenter = await User.findById(commenterId);

    if (!mentioned || !commenter) return;

    // Create in-app notification
    if (mentioned.notificationPreferences.inApp) {
        await createNotification({
            recipient: mentionedUserId,
            sender: commenterId,
            type: NOTIFICATION_TYPES.TASK_MENTION,
            message: `${commenter.name} mentioned you in a comment on: ${task.title}`,
            task: task._id,
            project: task.project,
        });
    }

    // Send email notification
    if (mentioned.notificationPreferences.email) {
        const taskUrl = `${process.env.CLIENT_URL}/tasks/${task._id}`;
        const html = commentMentionEmail(mentioned.name, commenter.name, task.title, comment.content, taskUrl);

        await sendEmail({
            to: mentioned.email,
            subject: 'You were mentioned in a comment',
            html,
        }).catch(err => console.error('Email send error:', err));
    }
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
    await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
    });
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    notifyTaskAssigned,
    notifyCommentMention,
    deleteNotification,
};
