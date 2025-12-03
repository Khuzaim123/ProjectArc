const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Comment on task
router.post(
    '/task/:taskId',
    commentController.commentValidation,
    commentController.createComment
);

router.get('/task/:taskId', commentController.getCommentsByTask);

// Update/delete comment
router.patch('/:commentId', commentController.updateComment);

router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
