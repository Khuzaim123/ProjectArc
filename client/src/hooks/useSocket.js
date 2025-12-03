import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { initializeSocket, disconnectSocket, getSocket } from '../utils/socket';
import { selectAccessToken, selectIsAuthenticated } from '../features/auth/authSlice';

/**
 * Custom hook for Socket.IO connection management
 * Automatically connects when authenticated and disconnects on unmount
 */
export const useSocket = () => {
    const accessToken = useSelector(selectAccessToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            // Initialize socket connection
            socketRef.current = initializeSocket(accessToken);
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                disconnectSocket();
            }
        };
    }, [isAuthenticated, accessToken]);

    return socketRef.current;
};

/**
 * Custom hook to listen to specific socket events
 * @param {string} eventName - The event to listen to
 * @param {function} handler - The event handler function
 */
export const useSocketEvent = (eventName, handler) => {
    const socket = getSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(eventName, handler);

        return () => {
            socket.off(eventName, handler);
        };
    }, [socket, eventName, handler]);
};

export default useSocket;
