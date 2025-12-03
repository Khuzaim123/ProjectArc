import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FiHome,
    FiGrid,
    FiFolder,
    FiCheckSquare,
    FiUsers,
    FiTrello
} from 'react-icons/fi';

const Sidebar = () => {
    const navItems = [
        { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/workspaces', icon: FiGrid, label: 'Workspaces' },
        { to: '/projects', icon: FiFolder, label: 'Projects' },
        { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
        { to: '/kanban', icon: FiTrello, label: 'Kanban' },
        { to: '/team', icon: FiUsers, label: 'Team' },
    ];

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200">
            <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
