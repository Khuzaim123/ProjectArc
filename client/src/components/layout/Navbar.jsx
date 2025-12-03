import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} from '../../features/notifications/notificationsAPI';
import { FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Navbar = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const { data: notificationsData } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = Array.isArray(notificationsData?.data) ? notificationsData.data : [];
    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800">ProjectArc</span>
                </Link>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                        >
                            <FiBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
                                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllAsRead()}
                                            className="text-xs text-primary-600 hover:text-primary-700"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div>
                                    {notifications.length === 0 ? (
                                        <p className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No notifications
                                        </p>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification._id}
                                                onClick={() => markAsRead(notification._id)}
                                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {notification.title || notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        </button>

                        {/* User Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <FiUser className="w-4 h-4 mr-2" />
                                    Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <FiSettings className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                                <hr className="my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <FiLogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
