const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokenUtils');
const setupTaskHandlers = require('./taskHandlers');
const setupPresenceHandlers = require('./presenceHandlers');
const setupNotificationHandlers = require('./notificationHandlers');

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    // Authentication middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error - No token provided'));
        }

        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return next(new Error('Authentication error - Invalid token'));
        }

        socket.userId = decoded.userId;
        next();
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId}`);

        // Setup event handlers
        setupTaskHandlers(io, socket);
        setupPresenceHandlers(io, socket);
        const notificationHandlers = setupNotificationHandlers(io, socket);

        // Store notification handler for later use
        socket.notificationHandlers = notificationHandlers;

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

module.exports = initializeSocket;
