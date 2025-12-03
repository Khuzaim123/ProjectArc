const setupNotificationHandlers = (io, socket) => {
    // Join user's personal notification room
    socket.on('join-notifications', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User joined notification room: user-${userId}`);
    });

    // Send notification to specific user
    const sendNotificationToUser = (userId, notification) => {
        io.to(`user-${userId}`).emit('new-notification', notification);
    };

    return {
        sendNotificationToUser,
    };
};

module.exports = setupNotificationHandlers;
