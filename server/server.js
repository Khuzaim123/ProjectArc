require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const initializeSocket = require('./sockets');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const invitationRoutes = require('./routes/invitations');
const activityRoutes = require('./routes/activities');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/workspaces', apiLimiter, workspaceRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);
app.use('/api/comments', apiLimiter, commentRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/invitations', apiLimiter, invitationRoutes);
app.use('/api/activities', apiLimiter, activityRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to ProjectArc API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            workspaces: '/api/workspaces',
            projects: '/api/projects',
            tasks: '/api/tasks',
            comments: '/api/comments',
            notifications: '/api/notifications',
            invitations: '/api/invitations',
            activities: '/api/activities',
            upload: '/api/upload',
        },
    });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 39300;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 Socket.IO server ready for real-time connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = app;
