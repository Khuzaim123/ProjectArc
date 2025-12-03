// Application-wide constants

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:39300';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:39300';

export const ROLES = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MEMBER: 'Member',
};

export const PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};

export const TASK_STATUS = {
    TODO: 'Todo',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
};

export const PRIORITY_COLORS = {
    Low: 'text-green-600 bg-green-100',
    Medium: 'text-yellow-600 bg-yellow-100',
    High: 'text-orange-600 bg-orange-100',
    Critical: 'text-red-600 bg-red-100',
};

export const STATUS_COLORS = {
    'Todo': 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'In Review': 'bg-purple-100 text-purple-700',
    'Done': 'bg-green-100 text-green-700',
};
