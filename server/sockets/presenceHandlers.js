const User = require('../models/User');

const setupPresenceHandlers = (io, socket) => {
    // User comes online
    socket.on('user-online', async (userId) => {
        try {
            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: new Date(),
            });

            // Broadcast to all clients
            io.emit('user-presence', {
                userId,
                isOnline: true,
            });
        } catch (error) {
            console.error('Error updating user presence:', error);
        }
    });

    // User goes offline
    socket.on('disconnect', async () => {
        const userId = socket.userId;

        if (userId) {
            try {
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date(),
                });

                io.emit('user-presence', {
                    userId,
                    isOnline: false,
                });
            } catch (error) {
                console.error('Error updating user presence:', error);
            }
        }
    });
};

module.exports = setupPresenceHandlers;
