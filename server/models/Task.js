const mongoose = require('mongoose');
const { PRIORITY, TASK_STATUS } = require('../utils/constants');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            trim: true,
            maxlength: [200, 'Task title cannot be more than 200 characters'],
        },
        description: {
            type: String,
            trim: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        column: {
            type: String,
            required: true,
        },
        position: {
            type: Number,
            required: true,
            default: 0,
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        priority: {
            type: String,
            enum: Object.values(PRIORITY),
            default: PRIORITY.MEDIUM,
        },
        status: {
            type: String,
            enum: Object.values(TASK_STATUS),
            default: TASK_STATUS.TODO,
        },
        dueDate: {
            type: Date,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        subtasks: [
            {
                title: {
                    type: String,
                    required: true,
                },
                completed: {
                    type: Boolean,
                    default: false,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        attachments: [
            {
                filename: String,
                url: String,
                publicId: String,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        dependencies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Task',
            },
        ],
        activityLog: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                action: {
                    type: String,
                    required: true,
                },
                field: String,
                oldValue: String,
                newValue: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        labels: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
taskSchema.index({ project: 1, column: 1, position: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ dueDate: 1 });

// Virtual for subtask completion percentage
taskSchema.virtual('subtaskProgress').get(function () {
    if (this.subtasks.length === 0) return 0;
    const completed = this.subtasks.filter((st) => st.completed).length;
    return Math.round((completed / this.subtasks.length) * 100);
});

// Ensure virtuals are included in JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
