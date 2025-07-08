import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes";
import pool from "./config/db";
import { CommentModel } from "./comment/comment.model";
import { CommentService } from "./comment/comment.service";
import { CommentController } from "./comment/comment.controller";
import createCommentRoutes from "./comment/comment.routes";

dotenv.config();

const app = express();

// Initialize database models
const commentModel = new CommentModel(pool);
const commentService = new CommentService(commentModel);

const commentController = new CommentController(commentService);

// Initialize database tables
async function initializeDatabase() {
  try {
    await commentModel.createTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Initialize database
initializeDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static('public'));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Routes
app.use('/auth', authRoutes);
app.use('/api/comments', createCommentRoutes(commentController));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Test page route
app.get("/test-websocket", (req, res) => {
  res.sendFile('test-websocket.html', { root: './public' });
});

// WebSocket status endpoint
app.get("/ws/status", (req, res) => {
  const wsServer = (global as any).wsServer;
  if (wsServer) {
    res.json({
      connected: true,
      users: wsServer.getConnectedUsersCount(),
      typing: wsServer.getTypingUsersCount()
    });
  } else {
    res.json({
      connected: false,
      users: 0,
      typing: 0
    });
  }
});

export default app;