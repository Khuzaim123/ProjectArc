const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['created', 'updated', 'deleted', 'moved', 'completed', 'assigned', 'commented'],
            required: true,
        },
        entityType: {
            type: String,
            enum: ['project', 'task', 'member', 'workspace', 'comment'],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        entityName: {
            type: String,
            required: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            // Can store additional context like old/new values
        },
        metadata: {
            from: String, // e.g., "To Do" when moving task
            to: String,   // e.g., "Done" when moving task
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

// Auto-delete old activities after 90 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
