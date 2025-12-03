const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a project name'],
            trim: true,
            maxlength: [100, 'Project name cannot be more than 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        color: {
            type: String,
            default: '#3B82F6', // Default blue color
        },
        icon: {
            type: String,
            default: '📊',
        },
        columns: [
            {
                name: {
                    type: String,
                    required: true,
                },
                position: {
                    type: Number,
                    required: true,
                },
            },
        ],
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'on-hold', 'completed', 'archived'],
            default: 'active',
        },
        privacy: {
            type: String,
            enum: ['private', 'team', 'workspace'],
            default: 'workspace',
            // private: Only creator can see
            // team: Only assigned team members can see
            // workspace: All workspace members can see
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
projectSchema.index({ workspace: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
