# ProjectArc - Frontend Implementation Guide

This document provides detailed guidance on completing the remaining frontend implementation for ProjectArc.

## Current Status

✅ **Completed:**
- Backend fully implemented (models, controllers, routes, services, middleware, Socket.IO)
- Frontend project structure set up
- Vite + React configuration
- Tailwind CSS configuration
- Redux store basic setup
- Auth slice and API configuration
- Basic routing setup
- Login page (functional)
- Placeholder pages for other routes

🚧 **Remaining Work:**
- Complete all frontend pages with full functionality
- Implement Redux slices for workspaces, projects, tasks, notifications
- Build Kanban board with drag-and-drop
- Create Gantt chart component
- Implement Socket.IO client integration
- Build all reusable components
- Add form validation with Formik + Yup

---

## File Structure to Complete

```
client/src/
├── features/
│   ├── auth/
│   │   ├── authSlice.js ✅
│   │   ├── Login.jsx (needs completion)
│   │   └── Register.jsx (needs completion)
│   ├── workspaces/
│   │   ├── workspaceSlice.js (create)
│   │   ├── WorkspaceList.jsx (create)
│   │   └── CreateWorkspace.jsx (create)
│   ├── projects/
│   │   ├── projectSlice.js (create)
│   │   ├── ProjectList.jsx (create)
│   │   └── ProjectCard.jsx (create)
│   ├── tasks/
│   │   ├── taskSlice.js (create)
│   │   ├── TaskModal.jsx (create)
│   │   ├── TaskCard.jsx (create)
│   │   └── TaskDetail.jsx (create)
│   ├── kanban/
│   │   ├── KanbanBoard.jsx (needs full implementation)
│   │   ├── Column.jsx (create)
│   │   └── DraggableTask.jsx (create)
│   ├── gantt/
│   │   ├── GanttChart.jsx (create)
│   │   └── Timeline.jsx (create)
│   ├── dashboard/
│   │   ├── Dashboard.jsx (improve with real data)
│   │   ├── StatsCard.jsx (create)
│   │   └── ActivityFeed.jsx (create)
│   ├── notifications/
│   │   ├── notificationSlice.js (create)
│   │   ├── NotificationBell.jsx (create)
│   │   └── NotificationPanel.jsx (create)
│   └── comments/
│       ├── CommentSection.jsx (create)
│       └── CommentInput.jsx (create)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx (create)
│   │   ├── Sidebar.jsx (create)
│   │   └── Layout.jsx (create)
│   └── common/
│       ├── Button.jsx (create)
│       ├── Input.jsx (create)
│       ├── Modal.jsx (create)
│       ├── Dropdown.jsx (create)
│       ├── Avatar.jsx (create)
│       ├── LoadingSpinner.jsx (create)
│       └── ErrorMessage.jsx (create)
├── hooks/
│   ├── useAuth.js (create)
│   ├── useSocket.js (create)
│   └── useDebounce.js (create)
└── utils/
    ├── socket.js (create - Socket.IO client)
    ├── formatters.js (create - date/text formatting)
    ├── api.js ✅
    └── constants.js ✅
```

---

## Detailed Implementation Steps

### 1. Common Components

```javascript
// src/components/common/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

export default Button;
```

```javascript
// src/components/common/Modal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizes[size]} p-6 z-10`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

### 2. Socket.IO Integration

```javascript
// src/utils/socket.js
import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket = null;

export const initializeSocket = (accessToken) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;
```

```javascript
// src/hooks/useSocket.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { initializeSocket, disconnectSocket } from '../utils/socket';

export const useSocket = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socket = initializeSocket(accessToken);

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, accessToken]);
};
```

### 3. Task Slice Example

```javascript
// src/features/tasks/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId) => {
    const response = await api.get(`/api/tasks/project/${projectId}`);
    return response.data.data.tasks;
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data.data.task;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, updates }) => {
    const response = await api.patch(`/api/tasks/${taskId}`, updates);
    return response.data.data.task;
  }
);

export const moveTask = createAsyncThunk(
  'tasks/move',
  async ({ taskId, column, position }) => {
    const response = await api.patch(`/api/tasks/${taskId}/move`, { column, position });
    return response.data.data.task;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTaskOptimistic: (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });
  },
});

export const { addTask, updateTaskOptimistic } = taskSlice.actions;
export default taskSlice.reducer;
```

### 4. Kanban Board Implementation

```javascript
// src/features/kanban/KanbanBoard.jsx
import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksByProject, moveTask, updateTaskOptimistic } from '../tasks/taskSlice';
import { getSocket } from '../../utils/socket';

const KanbanBoard = ({ projectId }) => {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.tasks.tasks);
  const socket = getSocket();

  useEffect(() => {
    dispatch(fetchTasksByProject(projectId));

    // Socket listeners for real-time updates
    if (socket) {
      socket.emit('join-project', projectId);

      socket.on('task-created', (task) => {
        dispatch(addTask(task));
      });

      socket.on('task-updated', (task) => {
        dispatch(updateTaskOptimistic(task));
      });

      socket.on('task-moved', ({ taskId, column, position }) => {
        // Update UI optimistically
        dispatch(updateTaskOptimistic({ _id: taskId, column, position }));
      });

      return () => {
        socket.emit('leave-project', projectId);
        socket.off('task-created');
        socket.off('task-updated');
        socket.off('task-moved');
      };
    }
  }, [projectId, socket, dispatch]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId: taskId } = result;

    // Optimistic update
    dispatch(updateTaskOptimistic({
      _id: taskId,
      column: destination.droppableId,
      position: destination.index,
    }));

    // Emit socket event
    if (socket) {
      socket.emit('task-moved', {
        projectId,
        taskId,
        column: destination.droppableId,
        position: destination.index,
      });
    }

    // Update backend
    dispatch(moveTask({
      taskId,
      column: destination.droppableId,
      position: destination.index,
    }));
  };

  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column} className="flex-shrink-0 w-80">
            <h3 className="font-semibold mb-4 px-2">{column}</h3>
            <Droppable droppableId={column}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-100 rounded-lg p-2 min-h-[500px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {tasks
                    .filter((task) => task.column === column)
                    .sort((a, b) => a.position - b.position)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm mb-2 ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded ${
                                task.priority === 'High' 
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                              {task.assignee && (
                                <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">
                                  {task.assignee.name[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
```

### 5. Register Page Implementation

```javascript
// src/pages/Register.jsx - Complete implementation
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const { user, accessToken } = response.data.data;
      dispatch(setCredentials({ user, accessToken }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gradient mb-6">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

---

## Next Steps

1. **Add remaining Redux slices** (workspaces, projects, notifications)
2. **Build common components** (Button, Modal, Input, etc.)
3. **Implement Socket.IO** throughout the app
4. **Complete all pages** with real API integration
5. ** Build Gantt chart** using a library like `react-gantt-chart` or custom implementation
6. **Add form validation** using Formik and Yup
7. **Implement notification system** with real-time updates
8. **Polish UI/UX** with loading states, error handling, and animations
9. **Test** all features end-to-end
10. **Optimize** performance (memoization, code splitting)

## Resources

- [React Beautiful DND](https://github.com/atlassian/react-beautiful-dnd)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Formik](https://formik.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

This guide provides the patterns and examples needed to complete the frontend. Follow the same patterns for the remaining features!
