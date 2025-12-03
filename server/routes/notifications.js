const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', notificationController.getNotifications);

router.get('/unread-count', notificationController.getUnreadCount);

router.patch('/:notificationId/read', notificationController.markAsRead);

router.patch('/read-all', notificationController.markAllAsRead);

router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
