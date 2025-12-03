const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['Admin', 'Member'],
            default: 'Member',
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'expired'],
            default: 'pending',
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    },
    {
        timestamps: true,
    }
);

// Index for automatic cleanup of expired invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
