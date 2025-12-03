# ProjectArc

A production-ready MERN stack Project Management Tool with real-time collaboration, Kanban boards, Gantt charts, and comprehensive team management features.

![ProjectArc Banner](https://via.placeholder.com/1200x300/3B82F6/FFFFFF?text=ProjectArc+-+Project+Management+Tool)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Real-time Features](#real-time-features)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication with access & refresh tokens
- ✅ Role-based permissions (Owner, Admin, Member)
- ✅ Secure workspace invite system
- ✅ Email + password login

### Workspace Management
- ✅ Create and manage multiple workspaces
- ✅ Invite team members with role assignment
- ✅ Workspace-level permission control

### Project & Task Management
- ✅ Full CRUD operations for projects and tasks
- ✅ Task fields: title, description, priority, status, due date, assignee
- ✅ Subtasks with completion tracking
- ✅ File attachments (Cloudinary integration)
- ✅ Comprehensive activity log

### Kanban Board
- ✅ Draggable columns and tasks
- ✅ Real-time updates via WebSockets (Socket.IO)
- ✅ Optimistic UI updates with server sync
- ✅ Custom column management

### Gantt Timeline View
- 📅 Horizontal timeline with task visualization
- 📅 Drag to resize task durations
- 📅 Task dependency support

### Team Collaboration
- ✅ Task comments with rich text support
- ✅ @mentions with auto-complete
- ✅ Online/offline presence indicators
- ✅ Real-time comment updates

### Notification System
- ✅ In-app notifications with unread counter
- ✅ Email notifications for key events
- ✅ Notification preferences per user
- ✅ Real-time notifications via WebSocket

### Dashboard & Analytics
- 📊 Project overview cards
- 📊 Upcoming deadlines widget
- 📊 Task status distribution charts
- 📊 Recent activity feed

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.IO
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Validation:** express-validator
- **Security:** helmet, express-rate-limit, express-mongo-sanitize, xss-clean, bcryptjs, cors

### Frontend
- **Framework:** React 18 with Vite
- **State Management:** Redux Toolkit
- **API Client:** RTK Query
- **Routing:** React Router v6
- **UI Framework:** Tailwind CSS
- **Drag & Drop:** react-beautiful-dnd
- **Forms:** Formik + Yup
- **Icons:** React Icons
- **Real-time:** socket.io-client

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)
- Gmail account (for email notifications)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/projectarc
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=ProjectArc <noreply@projectarc.com>
   CLIENT_URL=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server:**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Client will run on `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

### Backend (`/server`)

```
server/
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── cloudinary.js         # Cloudinary config
│   └── email.js              # Email transporter
├── controllers/
│   ├── authController.js
│   ├── workspaceController.js
│   ├── projectController.js
│   ├── taskController.js
│   ├── commentController.js
│   ├── notificationController.js
│   └── uploadController.js
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── permissions.js        # Role-based access
│   ├── errorHandler.js
│   ├── validator.js
│   └── rateLimiter.js
├── models/
│   ├── User.js
│   ├── Workspace.js
│   ├── Project.js
│   ├── Task.js
│   ├── Comment.js
│   ├── Notification.js
│   ├── Invitation.js
│   └── RefreshToken.js
├── routes/
│   ├── auth.js
│   ├── workspaces.js
│   ├── projects.js
│   ├── tasks.js
│   ├── comments.js
│   ├── notifications.js
│   └── upload.js
├── services/
│   ├── authService.js
│   ├── emailService.js
│   ├── notificationService.js
│   ├── activityService.js
│   └── uploadService.js
├── sockets/
│   ├── index.js
│   ├── taskHandlers.js
│   ├── presenceHandlers.js
│   └── notificationHandlers.js
├── utils/
│   ├── tokenUtils.js
│   ├── responseUtils.js
│   └── constants.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

### Frontend (`/client`)

```
client/
├── public/
├── src/
│   ├── app/
│   │   ├── store.js          # Redux store
│   │   └── api.js            # RTK Query base
│   ├── features/
│   │   ├── auth/
│   │   ├── workspaces/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── kanban/
│   │   ├── gantt/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   └── comments/
│   ├── components/
│   │   ├── layout/
│   │   └── common/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken={refreshToken}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### Workspace Endpoints

#### Create Workspace
```http
POST /api/workspaces
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "My Workspace",
  "description": "Description here"
}
```

#### Get All Workspaces
```http
GET /api/workspaces
Authorization: Bearer {accessToken}
```

#### Get Workspace by ID
```http
GET /api/workspaces/:workspaceId
Authorization: Bearer {accessToken}
```

#### Generate Invite Link
```http
POST /api/workspaces/:workspaceId/invite
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "Member"
}
```

#### Join Workspace
```http
POST /api/workspaces/join/:token
Authorization: Bearer {accessToken}
```

### Project Endpoints

#### Create Project
```http
POST /api/projects
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Description",
  "workspace": "workspaceId",
  "color": "#3B82F6",
  "icon": "📊"
}
```

#### Get Projects by Workspace
```http
GET /api/projects/workspace/:workspaceId
Authorization: Bearer {accessToken}
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task description",
  "project": "projectId",
  "column": "To Do",
  "priority": "High",
  "assignee": "userId",
  "dueDate": "2024-12-31"
}
```

#### Get Tasks by Project
```http
GET /api/tasks/project/:projectId
Authorization: Bearer {accessToken}
```

#### Move Task (Kanban)
```http
PATCH /api/tasks/:taskId/move
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "column": "In Progress",
  "position": 2
}
```

#### Add Subtask
```http
POST /api/tasks/:taskId/subtasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Subtask title"
}
```

### Comment Endpoints

#### Add Comment
```http
POST /api/comments/task/:taskId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "This is a comment with @userId mention"
}
```

### File Upload

#### Upload Attachment
```http
POST /api/upload/task/:taskId
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [file data]
```

### Notifications

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {accessToken}
```

#### Mark as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer {accessToken}
```

## 🔌 Real-time Features

### Socket.IO Events

#### Client → Server

- `join-project` - Join a project room for real-time updates
- `leave-project` - Leave a project room
- `task-created` - Broadcast new task creation
- `task-updated` - Broadcast task updates
- `task-moved` - Broadcast task position changes
- `task-deleted` - Broadcast task deletion
- `typing-comment` - User is typing a comment
- `user-online` - User comes online

#### Server → Client

- `task-created` - New task notification
- `task-updated` - Task update notification
- `task-moved` - Task position change
- `task-deleted` - Task deletion notification
- `new-notification` - New notification received
- `user-presence` - User online/offline status
- `user-typing-comment` - Someone is typing

### Connecting to Socket.IO (Frontend)

```javascript
import { io } from 'socket.io-client';

const socket = io(SOCKET_URL, {
  auth: {
    token: accessToken
  }
});

// Join project room
socket.emit('join-project', projectId);

// Listen for task updates
socket.on('task-updated', (task) => {
  // Update UI
});
```

## 🔐 Security Features

- **JWT Authentication** with access & refresh tokens
- **Password Hashing** with bcrypt (salt rounds: 10)
- **Rate Limiting** (100 requests/15 min, 5 auth attempts/15 min)
- **Input Validation** with express-validator
- **NoSQL Injection Prevention** with express-mongo-sanitize
- **XSS Protection** with xss-clean
- **Security Headers** with Helmet.js
- **CORS Configuration** with whitelisted origins
- **HTTP-Only Cookies** for refresh tokens

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Environment Variables:** Set all required env variables
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Node Version:** 18+

### Frontend Deployment (Vercel/Netlify)

1. **Build Command:** `npm run build`
2. **Output Directory:** `dist`
3. **Environment Variables:** Set `VITE_API_URL` and `VITE_SOCKET_URL`

### Database (MongoDB Atlas)

1. Create cluster
2. Configure IP whitelist (allow all: 0.0.0.0/0 for cloud deployment)
3. Create database user
4. Copy connection string to `MONGO_URI`

### File Storage (Cloudinary)

1. Sign up at cloudinary.com
2. Get cloud name, API key, and API secret from dashboard
3. Add to environment variables

### Email (Gmail)

1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Use App Password in `EMAIL_PASSWORD` env variable

## 📝 Testing

### Using Postman

1. Import the provided Postman collection (see `/postman` folder)
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000`
   - `accessToken`: (automatically set after login)
3. Test all endpoints in sequence

### Manual Testing Workflow

1. Register a new user
2. Login and receive tokens
3. Create a workspace
4. Invite team members
5. Create a project
6. Add tasks with various fields
7. Test Kanban drag & drop
8. Add comments with mentions
9. Upload file attachments
10. Check notifications

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Cloudinary for file storage
- MongoDB for database
- Express.js for backend framework
- React & Redux Toolkit for frontend

---

**ProjectArc** - Built with ❤️ using the MERN stack