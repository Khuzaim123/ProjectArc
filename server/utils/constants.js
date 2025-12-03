// Application-wide constants

// User Roles
const ROLES = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MEMBER: 'Member',
};

// Task Priority
const PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};

// Task Status
const TASK_STATUS = {
    TODO: 'Todo',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
};

// Notification Types
const NOTIFICATION_TYPES = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_UPDATED: 'task_updated',
    TASK_COMMENT: 'task_comment',
    TASK_MENTION: 'task_mention',
    TASK_DUE_SOON: 'task_due_soon',
    TASK_OVERDUE: 'task_overdue',
    PROJECT_INVITE: 'project_invite',
    WORKSPACE_INVITE: 'workspace_invite',
};

// Activity Types
const ACTIVITY_TYPES = {
    CREATED: 'created',
    UPDATED: 'updated',
    DELETED: 'deleted',
    ASSIGNED: 'assigned',
    UNASSIGNED: 'unassigned',
    COMMENTED: 'commented',
    STATUS_CHANGED: 'status_changed',
    PRIORITY_CHANGED: 'priority_changed',
    DUE_DATE_CHANGED: 'due_date_changed',
    ATTACHMENT_ADDED: 'attachment_added',
    ATTACHMENT_DELETED: 'attachment_deleted',
};

// Default Kanban Columns
const DEFAULT_COLUMNS = [
    { name: 'To Do', position: 0 },
    { name: 'In Progress', position: 1 },
    { name: 'In Review', position: 2 },
    { name: 'Done', position: 3 },
];

module.exports = {
    ROLES,
    PRIORITY,
    TASK_STATUS,
    NOTIFICATION_TYPES,
    ACTIVITY_TYPES,
    DEFAULT_COLUMNS,
};
