import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket = null;

export const initializeSocket = (accessToken) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: {
            token: accessToken,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => {
    return socket;
};

export default {
    initializeSocket,
    disconnectSocket,
    getSocket,
};
