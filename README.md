# Real-Time Collaborative Comments System

A full-stack real-time chat application built with Next.js, Express.js, and Socket.IO that supports real-time typing indicators, comment management, and user authentication.

## Features

### ✅ Real-Time Functionality
- **Live Typing Indicators**: See when other users are typing
- **Real-Time Comments**: Comments appear instantly across all connected users
- **Live Updates**: Comment edits and deletions sync in real-time
- **User Presence**: See when users join and leave the chat

### ✅ Comment Management
- **Create Comments**: Post new comments with real-time updates
- **Edit Comments**: Update your own comments with live sync
- **Delete Comments**: Remove your own comments with real-time removal
- **Comment History**: View all comments with timestamps and edit indicators

### ✅ User Authentication
- **Secure Login/Register**: User authentication with session management
- **Protected Routes**: Comment operations require authentication
- **User Sessions**: Persistent login state

### ✅ Modern UI/UX
- **Responsive Design**: Works on desktop and mobile
- **Real-Time Status**: Connection status indicator
- **Smooth Animations**: Typing indicators with bouncing dots
- **Clean Interface**: Modern, intuitive design

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling and validation

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe development
- **Socket.IO** - Real-time WebSocket server
- **SQLite** - Lightweight database
- **bcrypt** - Password hashing
- **express-session** - Session management

## Project Structure

```
AIV/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   └── comments/    # Comment-related components
│   │   ├── lib/             # Utilities and API clients
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── auth/            # Authentication logic
│   │   ├── comment/         # Comment management
│   │   ├── config/          # Database and Redis config
│   │   ├── ws/              # WebSocket server
│   │   └── server.ts        # Main server file
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AIV
   ```


          

   ```bash
   docker-compose up --build  
   ```
            OR

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Create `.env` file in the backend directory:
   Based on.env.example 

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Usage

### Authentication
1. Navigate to http://localhost:3000
2. You'll be redirected to the login page
3. Register a new account or login with existing credentials
4. You'll be redirected to the main chat interface

### Real-Time Chat
1. **View Comments**: All existing comments are displayed
2. **Post Comments**: Type in the comment form and click "Post Comment"
3. **See Typing Indicators**: When someone types, you'll see "X is typing..."
4. **Edit Comments**: Click "Edit" on your own comments
5. **Delete Comments**: Click "Delete" on your own comments

### Testing Real-Time Features
1. Open multiple browser tabs/windows
2. Login with different users
3. Start typing in one tab - you'll see typing indicators in other tabs
4. Post comments - they appear instantly across all tabs
5. Edit/delete comments - changes sync in real-time

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

### Comments
- `GET /api/comments` - Get all comments (public)
- `POST /api/comments` - Create new comment (authenticated)
- `PUT /api/comments/:id` - Update comment (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated)

## WebSocket Events

### Client to Server
- `user:join` - Join chat room
- `user:typing` - Send typing indicator
- `comment:new` - Create new comment
- `comment:update` - Update comment
- `comment:delete` - Delete comment

### Server to Client
- `user:joined` - User joined notification
- `user:left` - User left notification
- `user:typing` - Typing indicator update
- `comment:created` - New comment notification
- `comment:updated` - Comment update notification
- `comment:deleted` - Comment deletion notification

## Key Features Explained

### Real-Time Typing Indicators
- Users see "X is typing..." when someone is typing
- Automatic timeout after 2 seconds of inactivity
- Cleanup when users disconnect
- Smooth animations with bouncing dots

### Comment Synchronization
- New comments appear instantly across all clients
- Edits sync in real-time
- Deletions remove comments from all clients
- No page refresh required

### Authentication & Security
- Session-based authentication
- Protected routes for comment operations
- Users can only edit/delete their own comments
- Secure password hashing with bcrypt

### Error Handling
- Graceful WebSocket reconnection
- API error handling with user feedback
- Connection status indicators
- Fallback to API calls if WebSocket fails


