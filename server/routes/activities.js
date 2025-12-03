const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get recent activities across all workspaces
router.get('/recent', activityController.getRecentActivities);

// Get activities for specific workspace
router.get('/:workspaceId', activityController.getWorkspaceActivities);

module.exports = router;
