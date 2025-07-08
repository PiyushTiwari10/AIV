import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface User {
  id: string;
  username: string;
  socketId: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private users: Map<string, User> = new Map();
  private typingUsers: Map<string, { username: string; timestamp: number }> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:4000"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    console.log('🔌 WebSocket server initialized');
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);
      console.log(`📊 Total connected users: ${this.users.size + 1}`);

      // Handle user join
      socket.on('user:join', (data: { username: string }) => {
        console.log(`🎯 Received user:join event from ${socket.id}:`, data);
        
        const user: User = {
          id: socket.id,
          username: data.username,
          socketId: socket.id
        };

        this.users.set(socket.id, user);
        
        // Broadcast user joined
        socket.broadcast.emit('user:joined', {
          username: data.username,
          userId: socket.id
        });

        // Send current users to the new user
        socket.emit('users:list', Array.from(this.users.values()));
        
        // Broadcast updated users list to all clients
        this.broadcastActiveUsers();
        
        console.log(`👋 ${data.username} joined the chat`);
      });

      // Handle typing indicators - updated to match frontend expectations
      socket.on('user:typing', (data: { isTyping: boolean; username: string }) => {
        if (data.isTyping) {
          this.typingUsers.set(socket.id, {
            username: data.username,
            timestamp: Date.now()
          });
          socket.broadcast.emit('user:typing', {
            userId: socket.id,
            username: data.username,
            isTyping: true
          });
          console.log(`✍️ ${data.username} started typing`);
        } else {
          this.typingUsers.delete(socket.id);
          socket.broadcast.emit('user:typing', {
            userId: socket.id,
            username: data.username,
            isTyping: false
          });
          console.log(`⏹️ ${data.username} stopped typing`);
        }
      });

      // Handle new comment
      socket.on('comment:new', (data: { comment: any, username: string }) => {
        socket.broadcast.emit('comment:created', data.comment);
        console.log(`💬 ${data.username} posted a comment`);
      });

      // Handle comment updates
      socket.on('comment:update', (data: { comment: any, username: string }) => {
        socket.broadcast.emit('comment:updated', data.comment);
        console.log(`✏️ ${data.username} updated a comment`);
      });

      // Handle comment deletion
      socket.on('comment:delete', (data: { id: string, username: string }) => {
        socket.broadcast.emit('comment:deleted', { id: data.id });
        console.log(`🗑️ ${data.username} deleted a comment`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = this.users.get(socket.id);
        if (user) {
          this.users.delete(socket.id);
          this.typingUsers.delete(socket.id);
          
          socket.broadcast.emit('user:left', {
            username: user.username,
            userId: socket.id
          });
          
          // Broadcast updated users list to all clients
          this.broadcastActiveUsers();
          
          console.log(`👋 ${user.username} left the chat`);
        }
      });

      // Clean up expired typing indicators
      setInterval(() => {
        const now = Date.now();
        for (const [socketId, typingData] of this.typingUsers.entries()) {
          if (now - typingData.timestamp > 3000) { // 3 seconds timeout
            this.typingUsers.delete(socketId);
            socket.broadcast.emit('user:typing', {
              userId: socketId,
              username: typingData.username,
              isTyping: false
            });
          }
        }
      }, 1000);
    });
  }

  // Method to broadcast new comment to all connected clients
  public broadcastNewComment(comment: any): void {
    this.io.emit('comment:created', comment);
  }

  // Method to broadcast comment update
  public broadcastCommentUpdate(comment: any): void {
    this.io.emit('comment:updated', comment);
  }

  // Method to broadcast comment deletion
  public broadcastCommentDelete(commentId: string): void {
    this.io.emit('comment:deleted', { id: commentId });
  }

  // Method to broadcast active users list
  public broadcastActiveUsers(): void {
    const activeUsers = Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username
    }));
    this.io.emit('active:users', activeUsers);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.users.size;
  }

  // Get typing users count
  public getTypingUsersCount(): number {
    return this.typingUsers.size;
  }

  // Get all typing users
  public getTypingUsers(): Array<{ userId: string; username: string }> {
    return Array.from(this.typingUsers.entries()).map(([socketId, data]) => ({
      userId: socketId,
      username: data.username
    }));
  }

  // Get all active users
  public getActiveUsers(): Array<{ id: string; username: string }> {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username
    }));
  }
}
