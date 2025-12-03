const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Task CRUD
router.post(
    '/',
    taskController.createTaskValidation,
    taskController.createTask
);

router.get('/project/:projectId', taskController.getTasksByProject);

router.get('/:taskId', taskController.getTaskById);

router.patch('/:taskId', taskController.updateTask);

router.delete('/:taskId', taskController.deleteTask);

// Task movement (Kanban)
router.patch(
    '/:taskId/move',
    taskController.moveTaskValidation,
    taskController.moveTask
);

// Subtask management
router.post(
    '/:taskId/subtasks',
    taskController.subtaskValidation,
    taskController.addSubtask
);

router.patch('/:taskId/subtasks/:subtaskId', taskController.updateSubtask);

router.delete('/:taskId/subtasks/:subtaskId', taskController.deleteSubtask);

module.exports = router;
