const mongoose = require('mongoose');
const crypto = require('crypto');

const workspaceInvitationSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        token: {
            type: String,
            unique: true,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'expired'],
            default: 'pending',
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member',
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
workspaceInvitationSchema.index({ email: 1, workspace: 1 });
workspaceInvitationSchema.index({ token: 1 });
workspaceInvitationSchema.index({ expiresAt: 1 });

// Generate unique token before saving
workspaceInvitationSchema.pre('save', function (next) {
    if (!this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// Set expiration date (7 days from creation)
workspaceInvitationSchema.pre('save', function (next) {
    if (!this.expiresAt) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        this.expiresAt = expirationDate;
    }
    next();
});

// Check if invitation is expired
workspaceInvitationSchema.methods.isExpired = function () {
    return this.expiresAt < new Date() || this.status === 'expired';
};

// Mark as expired if past expiration date
workspaceInvitationSchema.methods.checkAndMarkExpired = async function () {
    if (this.expiresAt < new Date() && this.status === 'pending') {
        this.status = 'expired';
        await this.save();
    }
    return this.status === 'expired';
};

const WorkspaceInvitation = mongoose.model('WorkspaceInvitation', workspaceInvitationSchema);

module.exports = WorkspaceInvitation;
