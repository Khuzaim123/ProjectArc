const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

// Public route - view invitation details
router.get(
    '/:token',
    invitationController.tokenValidation,
    invitationController.getInvitationDetails
);

// Protected routes
router.use(protect);

// Get user's pending invitations
router.get('/', invitationController.getUserInvitations);

// Accept invitation
router.post(
    '/:token/accept',
    invitationController.tokenValidation,
    invitationController.acceptInvitation
);

// Reject invitation
router.post(
    '/:token/reject',
    invitationController.tokenValidation,
    invitationController.rejectInvitation
);

module.exports = router;
