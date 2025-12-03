const mongoose = require('mongoose');
const { ROLES, DEFAULT_COLUMNS } = require('../utils/constants');

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a workspace name'],
            trim: true,
            maxlength: [100, 'Workspace name cannot be more than 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: Object.values(ROLES),
                    default: ROLES.MEMBER,
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        projects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project',
            },
        ],
        settings: {
            defaultColumns: {
                type: [
                    {
                        name: String,
                        position: Number,
                    },
                ],
                default: DEFAULT_COLUMNS,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Add owner to members automatically
workspaceSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.members.push({
            user: this.owner,
            role: ROLES.OWNER,
        });
    }
    next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
