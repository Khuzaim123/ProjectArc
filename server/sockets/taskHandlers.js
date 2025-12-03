const Task = require('../models/Task');

const setupTaskHandlers = (io, socket) => {
    // Join project room
    socket.on('join-project', (projectId) => {
        socket.join(`project-${projectId}`);
        console.log(`User joined project room: project-${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId) => {
        socket.leave(`project-${projectId}`);
        console.log(`User left project room: project-${projectId}`);
    });

    // Task created
    socket.on('task-created', async (data) => {
        const { projectId, task } = data;

        // Broadcast to all users in the project
        io.to(`project-${projectId}`).emit('task-created', task);
    });

    // Task updated
    socket.on('task-updated', async (data) => {
        const { projectId, task } = data;

        // Broadcast to all users in the project
        io.to(`project-${projectId}`).emit('task-updated', task);
    });

    // Task moved (Kanban drag & drop)
    socket.on('task-moved', async (data) => {
        const { projectId, taskId, column, position } = data;

        try {
            const task = await Task.findById(taskId);

            if (task) {
                // Broadcast immediately for optimistic UI update
                socket.to(`project-${projectId}`).emit('task-moved', {
                    taskId,
                    column,
                    position,
                });
            }
        } catch (error) {
            console.error('Error in task-moved handler:', error);
        }
    });

    // Task deleted
    socket.on('task-deleted', async (data) => {
        const { projectId, taskId } = data;

        // Broadcast to all users in the project
        io.to(`project-${projectId}`).emit('task-deleted', { taskId });
    });

    // User is typing a comment
    socket.on('typing-comment', (data) => {
        const { taskId, userName } = data;

        socket.broadcast.emit('user-typing-comment', {
            taskId,
            userName,
        });
    });

    // User stopped typing
    socket.on('stop-typing-comment', (data) => {
        const { taskId } = data;

        socket.broadcast.emit('user-stopped-typing-comment', { taskId });
    });
};

module.exports = setupTaskHandlers;
