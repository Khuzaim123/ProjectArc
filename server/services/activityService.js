const Task = require('../models/Task');
const { ACTIVITY_TYPES } = require('../utils/constants');

// Log activity for a task
const logActivity = async (taskId, userId, action, details = {}) => {
    try {
        const task = await Task.findById(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        const activityEntry = {
            user: userId,
            action,
            timestamp: new Date(),
            ...details,
        };

        task.activityLog.push(activityEntry);
        await task.save();

        return activityEntry;
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
};

// Get task activity log
const getTaskActivity = async (taskId) => {
    const task = await Task.findById(taskId).populate('activityLog.user', 'name avatar');

    if (!task) {
        throw new Error('Task not found');
    }

    return task.activityLog.sort((a, b) => b.timestamp - a.timestamp);
};

module.exports = {
    logActivity,
    getTaskActivity,
    ACTIVITY_TYPES,
};
