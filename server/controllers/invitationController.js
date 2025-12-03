const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendInvitationEmail } = require('../services/emailService');

// @desc    Get user's pending invitations
// @route   GET /api/invitations
// @access  Private
const getUserInvitations = async (req, res, next) => {
    try {
        const invitations = await WorkspaceInvitation.find({
            email: req.user.email,
            status: 'pending',
        })
            .populate('workspace', 'name description')
            .populate('invitedBy', 'name email')
            .sort({ createdAt: -1 });

        // Check and mark expired invitations
        for (const invitation of invitations) {
            await invitation.checkAndMarkExpired();
        }

        // Filter out expired ones
        const activeInvitations = invitations.filter(
            (inv) => inv.status === 'pending'
        );

        successResponse(res, 200, 'Invitations retrieved successfully', {
            invitations: activeInvitations,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get invitation details by token
// @route   GET /api/invitations/:token
// @access  Public
const getInvitationDetails = async (req, res, next) => {
    try {
        const { token } = req.params;

        const invitation = await WorkspaceInvitation.findOne({ token })
            .populate('workspace', 'name description')
            .populate('invitedBy', 'name email');

        if (!invitation) {
            return errorResponse(res, 404, 'Invitation not found');
        }

        // Check if expired
        if (await invitation.checkAndMarkExpired()) {
            return errorResponse(res, 400, 'This invitation has expired');
        }

        if (invitation.status !== 'pending') {
            return errorResponse(
                res,
                400,
                `This invitation has already been ${invitation.status}`
            );
        }

        successResponse(res, 200, 'Invitation details retrieved', {
            invitation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept workspace invitation
// @route   POST /api/invitations/:token/accept
// @access  Private
const acceptInvitation = async (req, res, next) => {
    try {
        const { token } = req.params;

        const invitation = await WorkspaceInvitation.findOne({ token })
            .populate('workspace');

        if (!invitation) {
            return errorResponse(res, 404, 'Invitation not found');
        }

        // Check if invitation is for this user's email
        if (invitation.email !== req.user.email) {
            return errorResponse(
                res,
                403,
                'This invitation is not for your email address'
            );
        }

        // Check if expired
        if (await invitation.checkAndMarkExpired()) {
            return errorResponse(res, 400, 'This invitation has expired');
        }

        if (invitation.status !== 'pending') {
            return errorResponse(
                res,
                400,
                `This invitation has already been ${invitation.status}`
            );
        }

        const workspace = invitation.workspace;

        // Check if user is already a member
        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (isMember) {
            invitation.status = 'accepted';
            await invitation.save();
            return errorResponse(
                res,
                400,
                'You are already a member of this workspace'
            );
        }

        // Add user to workspace members
        const role = invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1);
        workspace.members.push({
            user: req.user._id,
            role: role,
        });

        await workspace.save();

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        successResponse(res, 200, 'Invitation accepted successfully', {
            workspace: {
                _id: workspace._id,
                name: workspace.name,
                description: workspace.description,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject workspace invitation
// @route   POST /api/invitations/:token/reject
// @access  Private
const rejectInvitation = async (req, res, next) => {
    try {
        const { token } = req.params;

        const invitation = await WorkspaceInvitation.findOne({ token });

        if (!invitation) {
            return errorResponse(res, 404, 'Invitation not found');
        }

        // Check if invitation is for this user's email
        if (invitation.email !== req.user.email) {
            return errorResponse(
                res,
                403,
                'This invitation is not for your email address'
            );
        }

        if (invitation.status !== 'pending') {
            return errorResponse(
                res,
                400,
                `This invitation has already been ${invitation.status}`
            );
        }

        invitation.status = 'rejected';
        await invitation.save();

        successResponse(res, 200, 'Invitation rejected successfully');
    } catch (error) {
        next(error);
    }
};

// Validation
const tokenValidation = [
    param('token').isString().notEmpty().withMessage('Token is required'),
    validate,
];

module.exports = {
    getUserInvitations,
    getInvitationDetails,
    acceptInvitation,
    rejectInvitation,
    tokenValidation,
};
