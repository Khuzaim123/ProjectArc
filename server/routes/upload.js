const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

// All routes are protected
router.use(protect);

// Upload attachment to task
router.post(
    '/task/:taskId',
    uploadLimiter,
    uploadController.upload.single('file'),
    uploadController.uploadAttachment
);

// Delete attachment
router.delete(
    '/task/:taskId/:attachmentId',
    uploadController.deleteAttachment
);

module.exports = router;
