const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../utils/constants');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPES),
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
